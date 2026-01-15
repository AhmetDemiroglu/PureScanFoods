import React, { useEffect, useState, useRef, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, Image, TouchableOpacity,
  Dimensions, Modal, ActivityIndicator, Pressable, Animated,
  PanResponder
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/colors';
import { useAuth } from '../context/AuthContext';
import { getScanHistoryFromDB, ScanResult } from '../lib/firestore';
import { doc, deleteDoc as firestoreDelete, collection, getDocs, writeBatch } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { TempStore } from '../lib/tempStore';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const SIDEBAR_WIDTH = SCREEN_WIDTH * 0.80;

interface HistorySidebarProps {
  visible: boolean;
  onClose: () => void;
}

// --- UTILS ---
const getScoreColor = (score: number): string => {
  if (score >= 80) return "#10B981";
  if (score >= 50) return "#F59E0B";
  return "#EF4444";
};

const getScoreBg = (score: number): string => {
  if (score >= 80) return "#ECFDF5";
  if (score >= 50) return "#FFFBEB";
  return "#FEF2F2";
};

const formatDate = (timestamp: any): string => {
  if (!timestamp) return "";
  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const mins = Math.floor(diff / (1000 * 60));
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (mins < 60) return `${mins}dk`;
  if (hours < 24) return `${hours}sa`;
  if (days === 0) return "Bugün";
  if (days === 1) return "Dün";
  if (days < 7) return `${days}g`;
  return date.toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' });
};

export default function HistorySidebar({ visible, onClose }: HistorySidebarProps) {
  const { user } = useAuth();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [history, setHistory] = useState<ScanResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<ScanResult | null>(null);
  const [showClearModal, setShowClearModal] = useState(false);
  const [clearing, setClearing] = useState(false);

  const slideAnim = useRef(new Animated.Value(SIDEBAR_WIDTH)).current;
  const backdropAnim = useRef(new Animated.Value(0)).current;

  // --- PAN RESPONDER (Swipe to close) ---
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => false,
      onMoveShouldSetPanResponder: (_, gesture) => {
        return gesture.dx > 15 && Math.abs(gesture.dy) < 30;
      },
      onPanResponderMove: (_, gesture) => {
        if (gesture.dx > 0) {
          slideAnim.setValue(gesture.dx);
        }
      },
      onPanResponderRelease: (_, gesture) => {
        if (gesture.dx > SIDEBAR_WIDTH * 0.35 || gesture.vx > 0.5) {
          closeWithAnimation();
        } else {
          Animated.spring(slideAnim, {
            toValue: 0,
            useNativeDriver: true,
            tension: 100,
            friction: 12
          }).start();
        }
      },
    })
  ).current;

  // --- ANIMATIONS ---
  useEffect(() => {
    if (visible) {
      loadHistory();
      Animated.parallel([
        Animated.spring(slideAnim, {
          toValue: 0,
          useNativeDriver: true,
          tension: 80,
          friction: 12
        }),
        Animated.timing(backdropAnim, {
          toValue: 1,
          duration: 250,
          useNativeDriver: true
        })
      ]).start();
    }
  }, [visible]);

  const closeWithAnimation = useCallback(() => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: SIDEBAR_WIDTH,
        duration: 200,
        useNativeDriver: true
      }),
      Animated.timing(backdropAnim, {
        toValue: 0,
        duration: 180,
        useNativeDriver: true
      })
    ]).start(() => onClose());
  }, [onClose]);

  // --- DATA ---
  const loadHistory = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const { data } = await getScanHistoryFromDB(user.uid, null, 50);
      setHistory(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  // --- ACTIONS ---
  const confirmDelete = async () => {
    if (!deleteTarget || !user) return;
    setHistory(prev => prev.filter(item => item.id !== deleteTarget.id));
    setDeleteTarget(null);
    try {
      await firestoreDelete(doc(db, "users", user.uid, "scans", deleteTarget.id));
    } catch (e) {
      console.error(e);
    }
  };

  const confirmClearAll = async () => {
    if (!user) return;
    setClearing(true);
    try {
      const scansRef = collection(db, "users", user.uid, "scans");
      const snapshot = await getDocs(scansRef);
      const batch = writeBatch(db);
      snapshot.docs.forEach(doc => batch.delete(doc.ref));
      await batch.commit();
      setHistory([]);
    } catch (e) {
      console.error(e);
    } finally {
      setClearing(false);
      setShowClearModal(false);
    }
  };

  const openDetail = (item: ScanResult) => {
    try {
      closeWithAnimation();

      const rawProduct = JSON.parse(item.miniData);
      const isNewFormat = rawProduct.product !== undefined;

      const resultData = isNewFormat ? {
        product: rawProduct.product,
        details: rawProduct.details,
        scores: rawProduct.scores,
        badges: item.badges,
        nutrition_facts: rawProduct.nutrition_facts,
        keto_analysis: rawProduct.keto_analysis
      } : {
        product: rawProduct,
        details: null,
        scores: {
          safety: { value: item.score, level: "unknown" },
          compatibility: { verdict: item.verdict, details: [] }
        },
        badges: item.badges,
        nutrition_facts: null,
        keto_analysis: null
      };

      TempStore.setResult(resultData, item.imageUrl || "");

      setTimeout(() => {
        router.push({
          pathname: "/product-result",
          params: { viewMode: "history" }
        });
      }, 220);

    } catch (e) {
      console.error("Veri hatası", e);
    }
  };

  // --- RENDER ---
  const renderCard = ({ item }: { item: ScanResult }) => {
    const scoreColor = getScoreColor(item.score);
    const scoreBg = getScoreBg(item.score);

    const getBadgeIcon = (badge: string): keyof typeof Ionicons.glyphMap => {
      if (badge.includes('SUGAR')) return 'water';
      if (badge.includes('FAT')) return 'flame';
      if (badge.includes('PROTEIN')) return 'barbell';
      if (badge.includes('FIBER')) return 'leaf';
      if (badge.includes('SODIUM')) return 'alert-circle';
      if (badge.includes('ALLERGEN')) return 'warning';
      if (badge.includes('BANNED') || badge.includes('WARN')) return 'ban';
      if (badge.includes('ORGANIC') || badge.includes('VEGAN')) return 'leaf';
      if (badge.includes('GLUTEN') || badge.includes('LACTOSE')) return 'checkmark-circle';
      return 'information-circle';
    };

    const isBadgeDanger = (badge: string): boolean => {
      return badge.includes('HIGH') || badge.includes('BANNED') || badge.includes('WARN') || badge.includes('ALLERGEN');
    };

    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => openDetail(item)}
        onLongPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          setDeleteTarget(item);
        }}
        delayLongPress={500}
        activeOpacity={0.85}
      >
        {/* Image Section */}
        <View style={styles.cardImageWrap}>
          {item.imageUrl ? (
            <Image source={{ uri: item.imageUrl }} style={styles.cardImage} />
          ) : (
            <View style={styles.cardImagePlaceholder}>
              <Ionicons name="cube-outline" size={28} color={Colors.gray[300]} />
            </View>
          )}

          {/* Score Badge - Overlay */}
          <View style={[styles.scoreBadge, { backgroundColor: scoreColor }]}>
            <Text style={styles.scoreBadgeText}>{item.score}</Text>
          </View>

          {/* Date - Overlay */}
          <View style={styles.dateBadge}>
            <Text style={styles.dateBadgeText}>{formatDate(item.createdAt)}</Text>
          </View>
        </View>

        {/* Content Section */}
        <View style={styles.cardContent}>
          {/* Badges Row */}
          {item.badges && item.badges.length > 0 && (
            <View style={styles.badgesRow}>
              {item.badges.slice(0, 4).map((badge, idx) => (
                <View
                  key={idx}
                  style={[
                    styles.miniBadge,
                    isBadgeDanger(badge) ? styles.miniBadgeDanger : styles.miniBadgeSuccess
                  ]}
                >
                  <Ionicons
                    name={getBadgeIcon(badge)}
                    size={10}
                    color={isBadgeDanger(badge) ? "#DC2626" : "#16A34A"}
                  />
                </View>
              ))}
              {item.badges.length > 4 && (
                <Text style={styles.moreBadgesText}>+{item.badges.length - 4}</Text>
              )}
            </View>
          )}

          {/* Product Name */}
          <Text style={styles.cardName} numberOfLines={1}>{item.productName}</Text>

          {/* Verdict (truncated) */}
          {item.verdict && (
            <Text style={styles.cardVerdict} numberOfLines={2}>{item.verdict}</Text>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  const renderEmpty = () => (
    <View style={styles.emptyWrap}>
      <View style={styles.emptyIcon}>
        <Ionicons name="scan" size={28} color={Colors.gray[300]} />
      </View>
      <Text style={styles.emptyText}>Henüz tarama yok</Text>
    </View>
  );

  // --- CONFIRMATION MODAL ---
  const ConfirmModal = ({
    visible,
    onClose,
    onConfirm,
    title,
    message,
    confirmText,
    loading
  }: {
    visible: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: string;
    confirmText: string;
    loading?: boolean;
  }) => (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
        <View style={styles.modalCard}>
          <View style={styles.modalIconWrap}>
            <Ionicons name="trash" size={24} color={Colors.error} />
          </View>
          <Text style={styles.modalTitle}>{title}</Text>
          <Text style={styles.modalMessage}>{message}</Text>
          <View style={styles.modalActions}>
            <TouchableOpacity
              style={styles.modalBtnCancel}
              onPress={onClose}
              disabled={loading}
            >
              <Text style={styles.modalBtnCancelText}>İptal</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.modalBtnConfirm}
              onPress={onConfirm}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator size="small" color="#FFF" />
              ) : (
                <Text style={styles.modalBtnConfirmText}>{confirmText}</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  if (!visible) return null;

  return (
    <Modal transparent visible={visible} animationType="none" onRequestClose={closeWithAnimation}>
      <View style={styles.container}>
        {/* Backdrop */}
        <Animated.View
          style={[styles.backdrop, { opacity: backdropAnim }]}
        >
          <Pressable style={StyleSheet.absoluteFill} onPress={closeWithAnimation} />
        </Animated.View>

        {/* Sidebar */}
        <Animated.View
          {...panResponder.panHandlers}
          style={[
            styles.sidebar,
            {
              transform: [{ translateX: slideAnim }],
              paddingTop: insets.top + 8,
              paddingBottom: insets.bottom + 8
            }
          ]}
        >
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Geçmiş</Text>
            <TouchableOpacity style={styles.closeBtn} onPress={closeWithAnimation}>
              <Ionicons name="close" size={18} color={Colors.gray[600]} />
            </TouchableOpacity>
          </View>

          {/* List */}
          <View style={styles.listWrap}>
            {loading ? (
              <View style={styles.loadingWrap}>
                <ActivityIndicator size="small" color={Colors.primary} />
              </View>
            ) : history.length === 0 ? (
              renderEmpty()
            ) : (
              <FlatList
                data={history}
                renderItem={renderCard}
                keyExtractor={item => item.id}
                numColumns={1}
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
              />
            )}
          </View>

          {/* Hint */}
          {history.length > 0 && (
            <Text style={styles.hintText}>Silmek için basılı tut</Text>
          )}

          {/* Footer */}
          {history.length > 0 && (
            <TouchableOpacity
              style={styles.clearBtn}
              onPress={() => setShowClearModal(true)}
            >
              <Ionicons name="trash-outline" size={14} color={Colors.gray[500]} />
              <Text style={styles.clearBtnText}>Temizle</Text>
            </TouchableOpacity>
          )}
        </Animated.View>

        {/* Delete Single Modal */}
        <ConfirmModal
          visible={deleteTarget !== null}
          onClose={() => setDeleteTarget(null)}
          onConfirm={confirmDelete}
          title="Taramayı Sil"
          message={`"${deleteTarget?.productName}" silinecek.`}
          confirmText="Sil"
        />

        {/* Clear All Modal */}
        <ConfirmModal
          visible={showClearModal}
          onClose={() => setShowClearModal(false)}
          onConfirm={confirmClearAll}
          title="Geçmişi Temizle"
          message={`${history.length} tarama kalıcı olarak silinecek.`}
          confirmText="Temizle"
          loading={clearing}
        />
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  sidebar: {
    width: SIDEBAR_WIDTH,
    height: '100%',
    backgroundColor: '#FFF',
    borderTopLeftRadius: 20,
    borderBottomLeftRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: -2, height: 0 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 8,
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray[100],
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.secondary,
  },
  closeBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.gray[100],
    alignItems: 'center',
    justifyContent: 'center',
  },

  // List
  listWrap: {
    flex: 1,
  },
  listContent: {
    padding: 10,
    gap: 8,
  },
  loadingWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Card
  card: {
    backgroundColor: '#FFF',
    borderRadius: 14,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: Colors.gray[100],
  },
  cardImageWrap: {
    width: '100%',
    height: 75,
    backgroundColor: Colors.gray[100],
  },
  cardImage: {
    width: '100%',
    height: '100%',
  },
  cardImagePlaceholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.gray[100],
  },
  scoreBadge: {
    position: 'absolute',
    top: 6,
    right: 6,
    minWidth: 28,
    height: 28,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  scoreBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#FFF',
  },
  dateBadge: {
    position: 'absolute',
    bottom: 6,
    left: 6,
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  dateBadgeText: {
    fontSize: 9,
    fontWeight: '600',
    color: '#FFF',
  },
  cardContent: {
    padding: 10,
    gap: 4,
  },
  badgesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 2,
  },
  miniBadge: {
    width: 18,
    height: 18,
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  miniBadgeDanger: {
    backgroundColor: '#FEF2F2',
  },
  miniBadgeSuccess: {
    backgroundColor: '#F0FDF4',
  },
  moreBadgesText: {
    fontSize: 9,
    fontWeight: '600',
    color: Colors.gray[400],
    marginLeft: 2,
  },
  cardName: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.secondary,
  },
  cardVerdict: {
    fontSize: 11,
    color: Colors.gray[500],
    lineHeight: 14,
  },

  // Empty
  emptyWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  emptyIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.gray[100],
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: 12,
    color: Colors.gray[400],
  },

  // Footer
  clearBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    marginHorizontal: 10,
    marginBottom: 4,
    backgroundColor: Colors.gray[100],
    borderRadius: 10,
  },
  clearBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.gray[500],
  },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  modalCard: {
    width: '100%',
    maxWidth: 280,
    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
  },
  modalIconWrap: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#FEF2F2',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: Colors.secondary,
    marginBottom: 8,
  },
  modalMessage: {
    fontSize: 13,
    color: Colors.gray[500],
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 20,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 10,
    width: '100%',
  },
  modalBtnCancel: {
    flex: 1,
    paddingVertical: 12,
    backgroundColor: Colors.gray[100],
    borderRadius: 12,
    alignItems: 'center',
  },
  modalBtnCancelText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.gray[600],
  },
  modalBtnConfirm: {
    flex: 1,
    paddingVertical: 12,
    backgroundColor: Colors.error,
    borderRadius: 12,
    alignItems: 'center',
  },
  modalBtnConfirmText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFF',
  },
  hintText: {
    fontSize: 10,
    color: Colors.gray[300],
    textAlign: 'center',
    marginBottom: 6,
  },
});