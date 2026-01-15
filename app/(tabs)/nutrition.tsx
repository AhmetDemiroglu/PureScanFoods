import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  Switch,
  FlatList,
  TextInput,
  StatusBar,
  Pressable,
  LayoutAnimation,
  Platform,
  UIManager,
  PanResponder,
  Animated,
  Dimensions
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { Colors } from "../../constants/colors";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import {
  getAllDietTypes,
  getDietDefinition,
  DIET_DEFINITIONS
} from "../../lib/diets";
import {
  getAllAllergenTypes,
  AllergenType,
  getAllergenDefinition,
  ALLERGEN_DEFINITIONS
} from "../../lib/allergens";
import { useUser, FamilyRole } from "../../context/UserContext";
import * as Haptics from "expo-haptics";

const getSafeIcon = (iconName: string): any => iconName === "person" ? "account" : iconName;

if (Platform.OS === 'android') {
  if (UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
  }
}

type AvatarIconName = keyof typeof MaterialCommunityIcons.glyphMap;

// --- AVATAR ASSETS ---
const AVATAR_COLOR_CATEGORIES = {
  red: {
    labelTr: "Kırmızı",
    labelEn: "Red",
    colors: ["#FEE2E2", "#FECACA", "#FCA5A5", "#F87171", "#EF4444", "#DC2626", "#B91C1C", "#991B1B", "#7F1D1D"]
  },
  orange: {
    labelTr: "Turuncu",
    labelEn: "Orange",
    colors: ["#FFEDD5", "#FED7AA", "#FDBA74", "#FB923C", "#F97316", "#EA580C", "#C2410C", "#9A3412", "#7C2D12"]
  },
  yellow: {
    labelTr: "Sarı",
    labelEn: "Yellow",
    colors: ["#FEF9C3", "#FEF08A", "#FDE047", "#FACC15", "#EAB308", "#CA8A04", "#A16207", "#854D0E", "#713F12"]
  },
  green: {
    labelTr: "Yeşil",
    labelEn: "Green",
    colors: ["#DCFCE7", "#BBF7D0", "#86EFAC", "#4ADE80", "#22C55E", "#16A34A", "#15803D", "#166534", "#14532D"]
  },
  teal: {
    labelTr: "Turkuaz",
    labelEn: "Teal",
    colors: ["#CCFBF1", "#99F6E4", "#5EEAD4", "#2DD4BF", "#14B8A6", "#0D9488", "#0F766E", "#115E59", "#134E4A"]
  },
  blue: {
    labelTr: "Mavi",
    labelEn: "Blue",
    colors: ["#DBEAFE", "#BFDBFE", "#93C5FD", "#60A5FA", "#3B82F6", "#2563EB", "#1D4ED8", "#1E40AF", "#1E3A8A"]
  },
  purple: {
    labelTr: "Mor",
    labelEn: "Purple",
    colors: ["#F3E8FF", "#E9D5FF", "#D8B4FE", "#C084FC", "#A855F7", "#9333EA", "#7E22CE", "#6B21A8", "#581C87"]
  },
  pink: {
    labelTr: "Pembe",
    labelEn: "Pink",
    colors: ["#FCE7F3", "#FBCFE8", "#F9A8D4", "#F472B6", "#EC4899", "#DB2777", "#BE185D", "#9D174D", "#831843"]
  },
  gray: {
    labelTr: "Gri",
    labelEn: "Gray",
    colors: ["#F8FAFC", "#E2E8F0", "#CBD5E1", "#94A3B8", "#64748B", "#475569", "#334155", "#1E293B", "#0F172A"]
  }
};

const AVATAR_COLORS = Object.values(AVATAR_COLOR_CATEGORIES).flatMap(cat => cat.colors);

const AVATAR_ICON_CATEGORIES: Record<string, { labelTr: string; labelEn: string; icons: AvatarIconName[] }> = {
  people: {
    labelTr: "Kişiler",
    labelEn: "People",
    icons: ["account", "account-circle", "face-man", "face-woman", "human", "human-handsup", "human-greeting", "ninja", "pirate", "baby-face"]
  },
  emotions: {
    labelTr: "Duygular",
    labelEn: "Emotions",
    icons: ["emoticon", "emoticon-happy", "emoticon-cool", "emoticon-wink", "emoticon-kiss", "emoticon-excited", "emoticon-tongue", "emoticon-devil", "emoticon-angry", "emoticon-sad", "emoticon-cry", "emoticon-lol"]
  },
  animals: {
    labelTr: "Hayvanlar",
    labelEn: "Animals",
    icons: ["cat", "dog", "rabbit", "panda", "koala", "penguin", "owl", "bird", "duck", "fish", "dolphin", "turtle", "butterfly", "bee", "ladybug", "elephant", "horse", "unicorn", "cow", "pig", "sheep", "teddy-bear", "paw"]
  },
  food: {
    labelTr: "Yiyecek",
    labelEn: "Food",
    icons: ["food-apple", "fruit-cherries", "fruit-grapes", "fruit-watermelon", "carrot", "corn", "chili-hot", "pizza", "hamburger", "food-hot-dog", "noodles", "bread-slice", "cookie", "cupcake", "cake", "ice-cream", "candy", "coffee", "beer"]
  },
  sports: {
    labelTr: "Spor",
    labelEn: "Sports",
    icons: ["basketball", "soccer", "football", "tennis", "volleyball", "baseball", "golf", "bowling", "bike", "run", "swim", "yoga", "meditation", "dumbbell", "trophy", "medal"]
  },
  fantasy: {
    labelTr: "Fantastik",
    labelEn: "Fantasy",
    icons: ["crown", "diamond-stone", "crystal-ball", "magic-staff", "wizard-hat", "shield", "shield-star", "sword", "lightning-bolt", "heart", "star", "rocket", "ufo", "alien", "robot", "ghost", "skull"]
  },
  nature: {
    labelTr: "Doğa",
    labelEn: "Nature",
    icons: ["flower", "flower-tulip", "clover", "tree", "palm-tree", "pine-tree", "cactus", "leaf", "weather-sunny", "moon-waning-crescent", "star-four-points", "fire", "water", "snowflake", "earth"]
  }
};

const AVATAR_ICONS = Object.values(AVATAR_ICON_CATEGORIES).flatMap(cat => cat.icons);

export default function NutritionScreen() {
  const router = useRouter();
  const { t, i18n } = useTranslation();
  const isTr = i18n.language === "tr";
  const insets = useSafeAreaInsets();

  // --- ANIMATED PAN RESPONDER ---
  const panY = React.useRef(new Animated.Value(0)).current;
  const screenHeight = Dimensions.get('window').height;

  const closeWithAnimation = (callback: () => void) => {
    Animated.timing(panY, {
      toValue: screenHeight,
      duration: 250,
      useNativeDriver: true,
    }).start(() => {
      callback();
    });
  };

  const panResponder = React.useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gestureState) => gestureState.dy > 5,
      onPanResponderMove: (_, gestureState) => {
        if (gestureState.dy > 0) {
          panY.setValue(gestureState.dy);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dy > 120 || gestureState.vy > 0.7) {
          closeWithAnimation(() => {
            setShowFamilyModal(false);
            setShowDietModal(false);
            setShowAllergenModal(false);
            setShowAvatarModal(false);
          });
        } else {
          Animated.spring(panY, {
            toValue: 0,
            bounciness: 4,
            useNativeDriver: true,
          }).start();
        }
      },
    })
  ).current;

  const {
    familyMembers,
    activeProfileId,
    setActiveProfileId,
    addFamilyMember: contextAddMember,
    updateProfileData: contextUpdateData,
    deleteFamilyMember: contextDeleteMember,
    updateMemberInfo,
    getActiveProfile,
    getActiveData
  } = useUser();

  const [editingMemberId, setEditingMemberId] = useState<string | null>(null);

  const [tempName, setTempName] = useState("");
  const [tempRole, setTempRole] = useState<FamilyRole>("child");
  const [tempColor, setTempColor] = useState(Colors.primary);
  const [tempIcon, setTempIcon] = useState<string>("account");

  // --- UI STATE  
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isDietExpanded, setIsDietExpanded] = useState(false);

  const [avatarTab, setAvatarTab] = useState<'colors' | 'icons'>('colors');
  const [colorCategory, setColorCategory] = useState<string>('blue');
  const [iconCategory, setIconCategory] = useState<string>('animals');

  // Modallar UI State
  const [showFamilyModal, setShowFamilyModal] = useState(false);
  const [showDietModal, setShowDietModal] = useState(false);
  const [showAllergenModal, setShowAllergenModal] = useState(false);
  const [showAvatarModal, setShowAvatarModal] = useState(false);

  // Form State (Geçici)
  const [newMemberName, setNewMemberName] = useState("");
  const [newMemberRole, setNewMemberRole] = useState<FamilyRole>("child");
  const [editingAvatarId, setEditingAvatarId] = useState<string | null>(null);

  React.useEffect(() => {
    if (showFamilyModal || showDietModal || showAllergenModal || showAvatarModal) {
      panY.setValue(0);
    }
  }, [showFamilyModal, showDietModal, showAllergenModal, showAvatarModal]);

  // --- HELPERS ---
  const activeData = getActiveData();
  const selectedDiet = activeData.diet;
  const userAllergens = activeData.allergens;

  // --- AVATAR HELPERS ---
  const getFilteredColors = () => {
    return AVATAR_COLOR_CATEGORIES[colorCategory as keyof typeof AVATAR_COLOR_CATEGORIES]?.colors || [];
  };

  const getFilteredIcons = () => {
    return AVATAR_ICON_CATEGORIES[iconCategory]?.icons || [];
  };

  const openAddModal = () => {
    setEditingMemberId(null);
    setTempName("");
    setTempRole("child");
    setTempColor(AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)]);
    setTempIcon("account");
    setShowFamilyModal(true);
  };

  const handleLongPressMember = (member: any) => {
    if (member.id === 'main_user') return;

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setEditingMemberId(member.id);
    setTempName(member.name);
    setTempRole(member.role);
    setTempColor(member.color);
    setTempIcon(member.avatarIcon);
    setShowFamilyModal(true);
  };

  const handleSaveMember = () => {
    if (!tempName.trim()) return;

    if (editingMemberId) {
      updateMemberInfo(editingMemberId, {
        name: tempName,
        role: tempRole,
        color: tempColor,
        avatarIcon: tempIcon
      });
    } else {
      contextAddMember(tempName, tempRole);
    }

    setShowFamilyModal(false);
  };

  const handleDeleteMember = () => {
    if (editingMemberId) {
      contextDeleteMember(editingMemberId);
      setShowFamilyModal(false);
    }
  };

  const openAvatarSelectorForEdit = () => {
    setShowFamilyModal(false);

    if (editingMemberId) {
      setEditingAvatarId(editingMemberId);
      setShowAvatarModal(true);
    } else {
      alert("Avatarı üye oluşturulduktan sonra değiştirebilirsiniz.");
    }
  };

  const handleColorSelect = (color: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (editingAvatarId) {
      const activeMember = familyMembers.find(m => m.id === editingAvatarId);
      updateMemberAvatar(editingAvatarId, color, activeMember?.avatarIcon || "account");
    }
  };

  const handleIconSelect = (icon: AvatarIconName) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (editingAvatarId) {
      const activeMember = familyMembers.find(m => m.id === editingAvatarId);
      updateMemberAvatar(editingAvatarId, activeMember?.color || Colors.primary, icon);
    }
  };

  const randomizeAvatar = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    if (editingAvatarId) {
      const randomColor = AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)];
      const randomIcon = AVATAR_ICONS[Math.floor(Math.random() * AVATAR_ICONS.length)];
      updateMemberAvatar(editingAvatarId, randomColor, randomIcon);
    }
  };

  // --- HANDLERS ---
  const handleNameChange = (text: string) => {
    updateMemberInfo("main_user", { name: text });
  };

  const updateMemberAvatar = (id: string, color: string, icon: any) => {
    updateMemberInfo(id, { color, avatarIcon: icon });
  };

  const openAvatarSelector = (id: string) => {
    setEditingAvatarId(id);
    setShowAvatarModal(true);
  };

  const addFamilyMember = () => {
    if (!newMemberName.trim()) return;
    // Context fonksiyonunu çağır (Renk/Icon mantığı Context içinde)
    contextAddMember(newMemberName, newMemberRole);

    setNewMemberName("");
    setNewMemberRole("child");
    setShowFamilyModal(false);
  };

  const toggleAllergenSelection = (type: AllergenType) => {
    const current = activeData.allergens;
    const updated = current.includes(type) ? current.filter(a => a !== type) : [...current, type];
    contextUpdateData(activeProfileId, "allergens", updated);
  };

  // --- RENDERERS ---
  const renderDietCard = () => {
    if (!selectedDiet) return (
      <View style={styles.emptyBox}>
        <Ionicons name="restaurant-outline" size={24} color={Colors.gray[400]} style={{ marginBottom: 8 }} />
        <Text style={styles.emptyText}>{t("nutrition.noDiet")}</Text>
      </View>
    );

    const def = getDietDefinition(selectedDiet);
    // Güvenlik kontrolü: def undefined ise render etme
    if (!def) return null;

    return (
      <TouchableOpacity
        style={[styles.novaCard, { borderLeftColor: Colors.primary }]}
        activeOpacity={0.9}
        onPress={() => {
          LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
          setIsDietExpanded(!isDietExpanded);
        }}
      >
        <View style={styles.novaHeader}>
          <View style={[styles.novaGroupBadge, { backgroundColor: Colors.primary }]}>
            <Ionicons name="leaf" size={20} color="#FFF" />
          </View>
          <View style={styles.novaTitleArea}>
            <Text style={styles.novaTitle}>{isTr ? def.nameTr : def.name}</Text>
            <Text style={styles.novaShortDesc} numberOfLines={1}>
              {isTr ? def.descriptionTr : def.description}
            </Text>
          </View>
          <Ionicons name={isDietExpanded ? "chevron-up" : "chevron-down"} size={20} color={Colors.gray[400]} />
        </View>

        {isDietExpanded && (
          <View style={styles.novaExpandedContent}>
            <Text style={styles.novaDescription}>{isTr ? def.descriptionTr : def.description}</Text>

            <View style={styles.aiInfoBox}>
              <View style={styles.aiHeader}>
                <Ionicons name="scan-circle" size={18} color={Colors.secondary} />
                <Text style={styles.aiTitle}>{isTr ? "Analiz Kapsamı" : "Analysis Scope"}</Text>
              </View>
              <Text style={styles.aiText}>
                {isTr ? def.aiExplanationTr : def.aiExplanation}
              </Text>
            </View>

            {def.severity === "strict" && (
              <View style={styles.tipRow}>
                <Ionicons name="alert-circle" size={16} color="#B91C1C" />
                <Text style={[styles.tipText, { color: "#B91C1C", fontWeight: '700' }]}>
                  {t("nutrition.strict")}
                </Text>
              </View>
            )}
          </View>
        )}
      </TouchableOpacity>
    );
  };

  const renderAllergenList = () => {
    if (userAllergens.length === 0) return (
      <View style={styles.emptyBox}>
        <Ionicons name="shield-checkmark-outline" size={24} color={Colors.gray[400]} style={{ marginBottom: 8 }} />
        <Text style={styles.emptyText}>{t("nutrition.noAllergen")}</Text>
      </View>
    );

    return (
      <View style={{ gap: 12 }}>
        {userAllergens.map((type) => {
          const def = getAllergenDefinition(type);
          if (!def) return null;

          return (
            <View key={type} style={[styles.novaCard, { borderLeftColor: Colors.error, paddingVertical: 12 }]}>
              <View style={styles.novaHeader}>
                <View style={[styles.novaGroupBadge, { backgroundColor: "#FEF2F2" }]}>
                  <Ionicons name="warning" size={20} color={Colors.error} />
                </View>
                <View style={styles.novaTitleArea}>
                  <Text style={styles.novaTitle}>{isTr ? def.nameTr : def.name}</Text>
                  <Text style={styles.novaShortDesc}>
                    {isTr ? def.descriptionTr : def.description}
                  </Text>
                </View>
              </View>
            </View>
          );
        })}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      {/* --- HEADER --- */}
      <LinearGradient
        colors={[Colors.primary, "#E65100"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <SafeAreaView edges={["top"]}>
          <View style={styles.headerContent}>
            <TouchableOpacity style={styles.backButton} onPress={() => router.canGoBack() ? router.back() : router.push("/")}>
              <Ionicons name="arrow-back" size={24} color="#FFF" />
            </TouchableOpacity>
            <View style={styles.headerTitleArea}>
              <Text style={styles.headerTitle}>{t("navigation.nutrition")}</Text>
              <Text style={styles.headerSubtitle}>{t("nutrition.subtitle")}</Text>
            </View>
          </View>

          {/* Profile Card */}
          <View style={styles.profileContainer}>
            {(() => {
              const mainUser = familyMembers.find(m => m.id === "main_user") || familyMembers[0];
              return (
                <>
                  <TouchableOpacity
                    style={[styles.avatarBox, { backgroundColor: mainUser?.color }]}
                    onPress={() => openAvatarSelector(mainUser.id)}
                  >
                    <MaterialCommunityIcons name={(mainUser?.avatarIcon as AvatarIconName) || "account"} size={24} color="#FFF" />
                    <View style={styles.premiumBadge}>
                      <Ionicons name="star" size={10} color="#FFF" />
                    </View>
                  </TouchableOpacity>

                  <View style={{ flex: 1, justifyContent: 'center' }}>
                    {isEditingProfile ? (
                      <TextInput
                        style={styles.profileInput}
                        value={mainUser?.name}
                        onChangeText={handleNameChange}
                        onBlur={() => setIsEditingProfile(false)}
                        autoFocus
                        selectionColor="#FFF"
                      />
                    ) : (
                      <TouchableOpacity onPress={() => setIsEditingProfile(true)} style={styles.nameRow}>
                        <Text style={styles.profileName}>{mainUser?.name}</Text>
                        <Ionicons name="pencil" size={14} color="rgba(255,255,255,0.7)" />
                      </TouchableOpacity>
                    )}
                    <Text style={styles.profileRole}>{isTr ? "Premium Üye" : "Premium Member"}</Text>
                  </View>
                </>
              );
            })()}
          </View>
        </SafeAreaView>
      </LinearGradient>

      {/* --- CONTENT --- */}
      <ScrollView
        style={styles.scrollContainer}
        contentContainerStyle={{ paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >

        {/* FAMILY PROFILES */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>{t("nutrition.family.title")}</Text>
            <TouchableOpacity onPress={openAddModal} style={styles.actionButton}>
              <Ionicons name="add" size={16} color={Colors.primary} />
              <Text style={styles.actionButtonText}>{t("nutrition.family.add")}</Text>
            </TouchableOpacity>
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 12 }}>
            {familyMembers.map((member) => {
              const isActive = activeProfileId === member.id;
              return (
                <TouchableOpacity
                  key={member.id}
                  style={[styles.memberCard, isActive && styles.memberCardActive]}
                  onPress={() => setActiveProfileId(member.id)}
                  onLongPress={() => handleLongPressMember(member)}
                  delayLongPress={500}
                >
                  <View style={[styles.memberAvatar, { backgroundColor: member.color }]}>
                    <MaterialCommunityIcons name={member.avatarIcon as AvatarIconName} size={20} color="#FFF" />
                  </View>
                  <Text style={[styles.memberName, isActive && { color: Colors.primary }]} numberOfLines={1}>
                    {member.name}
                  </Text>
                  <Text style={styles.memberRole}>{t(`nutrition.family.roles.${member.role}`)}</Text>
                  {isActive && (
                    <View style={styles.activeIndicator}>
                      <Ionicons name="checkmark" size={10} color="#FFF" />
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* DIET SECTION */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>{t("nutrition.dietTitle")}</Text>
            <TouchableOpacity onPress={() => setShowDietModal(true)} style={styles.actionButton}>
              <Text style={styles.actionButtonText}>{t("nutrition.change")}</Text>
            </TouchableOpacity>
          </View>
          {renderDietCard()}
        </View>

        {/* ALLERGENS SECTION */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>{t("nutrition.allergenTitle")}</Text>
            <TouchableOpacity onPress={() => setShowAllergenModal(true)} style={styles.actionButton}>
              <Text style={styles.actionButtonText}>{t("nutrition.edit")}</Text>
            </TouchableOpacity>
          </View>
          {renderAllergenList()}
        </View>

      </ScrollView>

      {/* --- MODALS --- */}

      {/* 1. FAMILY ADD MODAL */}
      <Modal visible={showFamilyModal} transparent animationType="fade" onRequestClose={() => setShowFamilyModal(false)}>
        <View style={styles.modalOverlay}>
          <Pressable style={styles.modalDismiss} onPress={() => setShowFamilyModal(false)} />
          <Animated.View
            style={[
              styles.bottomSheet,
              { paddingBottom: insets.bottom + 20 },
              { transform: [{ translateY: panY }] }
            ]}
            {...panResponder.panHandlers}
          >
            <View style={styles.bottomSheetHandle} />
            <View style={styles.sheetHeader}>
              <Text style={styles.sheetTitle}>
                {editingMemberId ? t("nutrition.family.edit") : t("nutrition.family.add")}
              </Text>
              <TouchableOpacity onPress={() => setShowFamilyModal(false)} style={styles.closeButton}>
                <Ionicons name="close" size={20} color={Colors.gray[500]} />
              </TouchableOpacity>
            </View>
            <View style={{ padding: 20 }}>
              {!!editingMemberId && (
                <TouchableOpacity style={{ alignSelf: 'center', marginBottom: 20 }} onPress={openAvatarSelectorForEdit}>
                  <View style={[styles.memberAvatar, { width: 80, height: 80, borderRadius: 40, backgroundColor: tempColor }]}>
                    <MaterialCommunityIcons name={getSafeIcon(tempIcon) as any} size={40} color="#FFF" />
                    <View style={styles.editBadge}>
                      <Ionicons name="pencil" size={14} color="#FFF" />
                    </View>
                  </View>
                </TouchableOpacity>
              )
              }

              <Text style={styles.inputLabel}>{t("nutrition.family.inputName")}</Text>
              <TextInput
                style={styles.modalInput}
                value={tempName}
                onChangeText={setTempName}
                placeholder="İsim"
              />
              <Text style={styles.inputLabel}>{t("nutrition.family.selectRole")}</Text>
              <View style={styles.roleContainer}>
                {["spouse", "child", "mother", "father", "sibling", "friend", "other"].map((role) => (
                  <TouchableOpacity
                    key={role}
                    style={[styles.roleChip, tempRole === role && styles.roleChipActive]}
                    onPress={() => setTempRole(role as FamilyRole)}
                  >
                    <Text style={[styles.roleText, tempRole === role && { color: '#FFF' }]}>
                      {t(`nutrition.family.roles.${role}`, role)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              <View style={{ flexDirection: 'row', gap: 12, marginTop: 32 }}>

                {/* SİL BUTONU */}
                {!!editingMemberId && (
                  <TouchableOpacity
                    style={[
                      styles.saveButton,
                      {
                        backgroundColor: '#FEE2E2',
                        marginTop: 0,
                        flex: 1,
                        paddingHorizontal: 0
                      }
                    ]}
                    onPress={handleDeleteMember}
                  >
                    <Text style={[styles.saveButtonText, { color: '#DC2626' }]}>
                      {t("nutrition.family.delete")}
                    </Text>
                  </TouchableOpacity>
                )}

                {/* KAYDET / GÜNCELLE BUTONU */}
                <TouchableOpacity
                  style={[
                    styles.saveButton,
                    {
                      marginTop: 0,
                      flex: 2
                    }
                  ]}
                  onPress={handleSaveMember}
                >
                  <Text style={styles.saveButtonText}>
                    {!!editingMemberId ? t("nutrition.family.update") : t("nutrition.family.save")}
                  </Text>
                </TouchableOpacity>

              </View>
            </View>
          </Animated.View>
        </View>
      </Modal >

      {/* 2. DIET MODAL */}
      < Modal visible={showDietModal} transparent animationType="fade" onRequestClose={() => setShowDietModal(false)
      }>
        <View style={styles.modalOverlay}>
          <Pressable style={styles.modalDismiss} onPress={() => setShowDietModal(false)} />
          <Animated.View
            style={[
              styles.bottomSheet,
              { paddingBottom: insets.bottom + 20 },
              { transform: [{ translateY: panY }] }
            ]}
            {...panResponder.panHandlers}
          >
            <View style={styles.bottomSheetHandle} />
            <View style={styles.sheetHeader}>
              <Text style={styles.sheetTitle}>{t("nutrition.modalDiet")}</Text>
              <TouchableOpacity onPress={() => setShowDietModal(false)} style={styles.closeButton}>
                <Ionicons name="close" size={20} color={Colors.gray[500]} />
              </TouchableOpacity>
            </View>
            <FlatList
              data={getAllDietTypes()}
              keyExtractor={(item) => item}
              contentContainerStyle={{ paddingHorizontal: 20 }}
              showsVerticalScrollIndicator={false}
              renderItem={({ item }) => {
                const def = DIET_DEFINITIONS[item];
                const isSelected = selectedDiet === item;
                return (
                  <TouchableOpacity
                    style={[styles.optionItem, isSelected && styles.optionItemSelected]}
                    onPress={() => {
                      contextUpdateData(activeProfileId, "diet", item);
                      setShowDietModal(false);
                    }}
                  >
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.optionTitle, isSelected && { color: Colors.primary }]}>{isTr ? def.nameTr : def.name}</Text>
                      <Text style={styles.optionDesc}>{isTr ? def.descriptionTr : def.description}</Text>
                    </View>
                    {isSelected && <Ionicons name="checkmark-circle" size={24} color={Colors.primary} />}
                  </TouchableOpacity>
                );
              }}
            />
          </Animated.View>
        </View>
      </Modal >

      {/* 3. ALLERGEN MODAL */}
      < Modal visible={showAllergenModal} transparent animationType="fade" onRequestClose={() => setShowAllergenModal(false)
      }>
        <View style={styles.modalOverlay}>
          <Pressable style={styles.modalDismiss} onPress={() => setShowAllergenModal(false)} />
          <Animated.View
            style={[
              styles.bottomSheet,
              { paddingBottom: insets.bottom + 20 },
              { transform: [{ translateY: panY }] }
            ]}
            {...panResponder.panHandlers}
          >
            <View style={styles.bottomSheetHandle} />
            <View style={styles.sheetHeader}>
              <Text style={styles.sheetTitle}>{t("nutrition.modalAllergen")}</Text>
              <TouchableOpacity onPress={() => setShowAllergenModal(false)} style={styles.closeButton}>
                <Ionicons name="close" size={20} color={Colors.gray[500]} />
              </TouchableOpacity>
            </View>
            <FlatList
              data={getAllAllergenTypes()}
              keyExtractor={(item) => item}
              contentContainerStyle={{ paddingHorizontal: 20 }}
              showsVerticalScrollIndicator={false}
              renderItem={({ item }) => {
                const def = ALLERGEN_DEFINITIONS[item];
                const isSelected = userAllergens.includes(item);
                return (
                  <TouchableOpacity
                    style={[styles.optionItem, isSelected && styles.optionItemSelected]}
                    onPress={() => toggleAllergenSelection(item)}
                  >
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.optionTitle, isSelected && { color: Colors.error }]}>{isTr ? def.nameTr : def.name}</Text>
                      <Text style={styles.optionDesc}>{isTr ? def.descriptionTr : def.description}</Text>
                    </View>
                    <Switch value={isSelected} onValueChange={() => toggleAllergenSelection(item)} trackColor={{ false: Colors.gray[200], true: Colors.error }} />
                  </TouchableOpacity>
                );
              }}
            />
          </Animated.View>
        </View>
      </Modal >

      {/* 4. AVATAR BUILDER MODAL (NEW) */}
      < Modal visible={showAvatarModal} transparent animationType="fade" onRequestClose={() => setShowAvatarModal(false)
      }>
        <View style={styles.modalOverlay}>
          <Pressable style={styles.modalDismiss} onPress={() => setShowAvatarModal(false)} />

          <Animated.View
            style={[
              styles.avatarSheet,
              { paddingBottom: insets.bottom + 12 },
              { transform: [{ translateY: panY }] }
            ]}
            {...panResponder.panHandlers}
          >
            {/* Handle */}
            <View style={styles.avatarSheetHandle} />

            {/* Header with Hero Avatar */}
            {(() => {
              const activeMember = editingAvatarId ? familyMembers.find(m => m.id === editingAvatarId) : null;
              const activeColor = activeMember?.color || Colors.primary;
              const activeIcon = (activeMember?.avatarIcon || "account") as AvatarIconName;

              return (
                <>
                  {/* Hero Section */}
                  <View style={styles.avatarHeroSection}>
                    <View style={[styles.avatarHeroCircle, { backgroundColor: activeColor }]}>
                      <MaterialCommunityIcons name={activeIcon} size={44} color="#FFF" />
                    </View>
                    <Text style={styles.avatarHeroName}>{activeMember?.name}</Text>
                    <TouchableOpacity style={styles.randomButton} onPress={randomizeAvatar} activeOpacity={0.7}>
                      <MaterialCommunityIcons name="dice-5" size={16} color={Colors.primary} />
                      <Text style={styles.randomButtonText}>{isTr ? "Rastgele" : "Random"}</Text>
                    </TouchableOpacity>
                  </View>

                  {/* Segmented Tab */}
                  <View style={styles.segmentedControl}>
                    <TouchableOpacity
                      style={[styles.segmentTab, avatarTab === 'colors' && styles.segmentTabActive]}
                      onPress={() => setAvatarTab('colors')}
                    >
                      <MaterialCommunityIcons
                        name="palette"
                        size={16}
                        color={avatarTab === 'colors' ? '#FFF' : Colors.gray[500]}
                      />
                      <Text style={[styles.segmentTabText, avatarTab === 'colors' && styles.segmentTabTextActive]}>
                        {isTr ? "Renkler" : "Colors"}
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.segmentTab, avatarTab === 'icons' && styles.segmentTabActive]}
                      onPress={() => setAvatarTab('icons')}
                    >
                      <MaterialCommunityIcons
                        name="emoticon-outline"
                        size={16}
                        color={avatarTab === 'icons' ? '#FFF' : Colors.gray[500]}
                      />
                      <Text style={[styles.segmentTabText, avatarTab === 'icons' && styles.segmentTabTextActive]}>
                        {isTr ? "İkonlar" : "Icons"}
                      </Text>
                    </TouchableOpacity>
                  </View>

                  {/* Content Area */}
                  <View style={styles.avatarContentArea}>
                    {avatarTab === 'colors' ? (
                      <View style={styles.colorTabContent}>
                        {/* Color Category Chips */}
                        <ScrollView
                          horizontal
                          showsHorizontalScrollIndicator={false}
                          contentContainerStyle={styles.categoryChipsContainer}
                        >
                          {Object.entries(AVATAR_COLOR_CATEGORIES).map(([key, cat]) => (
                            <TouchableOpacity
                              key={key}
                              style={[styles.categoryChip, colorCategory === key && styles.categoryChipActive]}
                              onPress={() => setColorCategory(key)}
                            >
                              <View style={[styles.categoryChipDot, { backgroundColor: cat.colors[4] }]} />
                              <Text style={[styles.categoryChipText, colorCategory === key && styles.categoryChipTextActive]}>
                                {isTr ? cat.labelTr : cat.labelEn}
                              </Text>
                            </TouchableOpacity>
                          ))}
                        </ScrollView>

                        {/* Color Grid */}
                        <View style={styles.colorGrid}>
                          {getFilteredColors().map(color => {
                            const isSelected = activeColor === color;
                            return (
                              <TouchableOpacity
                                key={color}
                                style={[
                                  styles.colorItem,
                                  { backgroundColor: color },
                                  isSelected && styles.colorItemSelected
                                ]}
                                onPress={() => handleColorSelect(color)}
                                activeOpacity={0.8}
                              >
                                {isSelected && (
                                  <View style={styles.colorCheckmark}>
                                    <Ionicons name="checkmark" size={14} color="#FFF" />
                                  </View>
                                )}
                              </TouchableOpacity>
                            );
                          })}
                        </View>
                      </View>
                    ) : (
                      <>
                        {/* Icon Category Chips */}
                        <ScrollView
                          horizontal
                          showsHorizontalScrollIndicator={false}
                          contentContainerStyle={styles.categoryChipsContainer}
                        >
                          {Object.entries(AVATAR_ICON_CATEGORIES).map(([key, cat]) => (
                            <TouchableOpacity
                              key={key}
                              style={[styles.categoryChip, iconCategory === key && styles.categoryChipActive]}
                              onPress={() => setIconCategory(key)}
                            >
                              <MaterialCommunityIcons
                                name={cat.icons[0]}
                                size={14}
                                color={iconCategory === key ? '#FFF' : Colors.gray[500]}
                              />
                              <Text style={[styles.categoryChipText, iconCategory === key && styles.categoryChipTextActive]}>
                                {isTr ? cat.labelTr : cat.labelEn}
                              </Text>
                            </TouchableOpacity>
                          ))}
                        </ScrollView>

                        {/* Icon Grid */}
                        <FlatList
                          data={getFilteredIcons()}
                          keyExtractor={(item) => item}
                          numColumns={5}
                          showsVerticalScrollIndicator={false}
                          contentContainerStyle={styles.iconGridContainer}
                          columnWrapperStyle={styles.iconGridRow}
                          renderItem={({ item }) => {
                            const isSelected = activeIcon === item;
                            return (
                              <TouchableOpacity
                                style={[
                                  styles.iconItem,
                                  isSelected && { backgroundColor: activeColor + '20', borderColor: activeColor }
                                ]}
                                onPress={() => handleIconSelect(item)}
                                activeOpacity={0.7}
                              >
                                <MaterialCommunityIcons
                                  name={item}
                                  size={24}
                                  color={isSelected ? activeColor : Colors.gray[600]}
                                />
                              </TouchableOpacity>
                            );
                          }}
                        />
                      </>
                    )}
                  </View>
                </>
              );
            })()}
          </Animated.View>
        </View>
      </Modal >

    </View >
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8FAFC" },
  header: { paddingBottom: 20 },
  headerContent: { flexDirection: "row", alignItems: "center", paddingHorizontal: 20, paddingTop: 10, marginBottom: 16 },
  backButton: { width: 40, height: 40, borderRadius: 20, backgroundColor: "rgba(255,255,255,0.2)", alignItems: "center", justifyContent: "center", marginRight: 12 },
  headerTitleArea: { flex: 1 },
  headerTitle: { fontSize: 22, fontWeight: "800", color: "#FFF" },
  headerSubtitle: { fontSize: 13, color: "rgba(255,255,255,0.8)", marginTop: 2 },
  profileContainer: { flexDirection: "row", alignItems: "center", marginHorizontal: 20, backgroundColor: "rgba(255,255,255,0.15)", padding: 12, borderRadius: 12, borderWidth: 1, borderColor: "rgba(255,255,255,0.2)" },
  avatarBox: { width: 44, height: 44, borderRadius: 22, alignItems: "center", justifyContent: "center", marginRight: 12 },
  premiumBadge: { position: "absolute", bottom: -2, right: -2, backgroundColor: "#F59E0B", width: 16, height: 16, borderRadius: 8, alignItems: "center", justifyContent: "center", borderWidth: 2, borderColor: "#FFF" },
  nameRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  profileName: { fontSize: 16, fontWeight: "700", color: "#FFF" },
  profileInput: { fontSize: 16, fontWeight: "700", color: "#FFF", borderBottomWidth: 1, borderBottomColor: "#FFF", paddingVertical: 0, height: 24 },
  profileRole: { fontSize: 12, color: "rgba(255,255,255,0.9)" },
  scrollContainer: { flex: 1, marginTop: 20, paddingHorizontal: 20 },
  section: { marginBottom: 28 },
  sectionHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 },
  sectionTitle: { fontSize: 18, fontWeight: "700", color: "#1E293B" },
  actionButton: { paddingVertical: 6, paddingHorizontal: 12, backgroundColor: "#F1F5F9", borderRadius: 8, flexDirection: 'row', alignItems: 'center', gap: 4 },
  actionButtonText: { fontSize: 13, fontWeight: "600", color: Colors.primary },

  memberCard: { width: 100, padding: 12, backgroundColor: "#FFF", borderRadius: 16, alignItems: 'center', borderWidth: 1, borderColor: "#E2E8F0", marginRight: 8 },
  memberCardActive: { borderColor: Colors.primary, backgroundColor: "#EFF6FF" },
  memberAvatar: { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  memberName: { fontSize: 13, fontWeight: '600', color: "#334155", textAlign: 'center' },
  memberRole: { fontSize: 11, color: "#94A3B8" },
  activeIndicator: { position: 'absolute', top: 8, right: 8, backgroundColor: Colors.primary, width: 16, height: 16, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },

  emptyBox: { padding: 24, backgroundColor: "#FFF", borderRadius: 16, alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: "#E2E8F0", borderStyle: "dashed" },
  emptyText: { color: "#94A3B8", fontSize: 14, fontWeight: "500" },
  novaCard: { backgroundColor: "#FFF", borderRadius: 16, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: "#E2E8F0", borderLeftWidth: 4, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.03, shadowRadius: 4, elevation: 2 },
  novaHeader: { flexDirection: "row", alignItems: "center", gap: 12 },
  novaGroupBadge: { width: 36, height: 36, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  novaTitleArea: { flex: 1 },
  novaTitle: { fontSize: 15, fontWeight: "700", color: Colors.secondary },
  novaShortDesc: { fontSize: 12, color: Colors.gray[500], marginTop: 2 },
  novaExpandedContent: { marginTop: 16, paddingTop: 16, borderTopWidth: 1, borderTopColor: "#F1F5F9" },
  novaDescription: { fontSize: 13, color: Colors.gray[700], lineHeight: 20, marginBottom: 12 },

  aiInfoBox: { backgroundColor: "#F8FAFC", borderRadius: 12, padding: 12, marginBottom: 12, borderWidth: 1, borderColor: "#E2E8F0" },
  aiHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 6, gap: 6 },
  aiTitle: { fontSize: 13, fontWeight: '700', color: Colors.secondary },
  aiText: { fontSize: 12, color: "#64748B", lineHeight: 18 },
  tipRow: { flexDirection: "row", alignItems: "center", gap: 8, backgroundColor: "#FEF2F2", padding: 8, borderRadius: 8 },
  tipText: { fontSize: 12 },

  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "flex-end" },
  modalDismiss: { flex: 1 },
  bottomSheet: { backgroundColor: "#FFF", borderTopLeftRadius: 24, borderTopRightRadius: 24, maxHeight: '80%', paddingTop: 12, shadowColor: "#000", shadowOffset: { width: 0, height: -4 }, shadowOpacity: 0.1, shadowRadius: 12, elevation: 20 },
  bottomSheetHandle: { width: 40, height: 5, backgroundColor: "#CBD5E1", borderRadius: 2.5, alignSelf: 'center', marginBottom: 20 },
  sheetHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingBottom: 15, borderBottomWidth: 1, borderBottomColor: "#F1F5F9" },
  sheetTitle: { fontSize: 18, fontWeight: "700", color: "#1E293B" },
  closeButton: { padding: 4, backgroundColor: "#F1F5F9", borderRadius: 12 },
  optionItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: "#F1F5F9" },
  optionItemSelected: { backgroundColor: "#F8FAFC", marginHorizontal: -20, paddingHorizontal: 20 },
  optionTitle: { fontSize: 16, fontWeight: "600", color: "#334155", marginBottom: 2 },
  optionDesc: { fontSize: 12, color: "#94A3B8" },

  inputLabel: { fontSize: 13, fontWeight: '600', color: "#64748B", marginBottom: 8, marginTop: 12 },
  modalInput: { backgroundColor: "#F1F5F9", borderRadius: 12, padding: 14, fontSize: 16, borderWidth: 1, borderColor: "#E2E8F0", color: "#1E293B", marginBottom: 20 },
  roleContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  roleChip: { paddingVertical: 8, paddingHorizontal: 16, borderRadius: 20, backgroundColor: "#F1F5F9", borderWidth: 1, borderColor: "#E2E8F0" },
  roleChipActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  roleText: { fontSize: 13, fontWeight: '600', color: "#64748B" },
  saveButton: { backgroundColor: Colors.primary, padding: 16, borderRadius: 16, alignItems: 'center', marginTop: 32, shadowColor: Colors.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8 },
  saveButtonText: { color: '#FFF', fontWeight: '700', fontSize: 16 },

  // AVATAR SELECTOR STYLES
  modalPreviewContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    backgroundColor: Colors.gray[100],
    padding: 12,
    borderRadius: 12
  },
  previewAvatarCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12
  },
  previewTitleText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.gray[800]
  },
  previewSubtitleText: {
    fontSize: 12,
    color: Colors.gray[500]
  },
  colorListContainer: {
    gap: 8,
    paddingRight: 16
  },
  colorCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 0 // Varsayılan border yok
  },
  iconGridColumnWrapper: {
    gap: 8 // X ekseni boşluğu
  },
  iconBox: {
    flex: 1,
    aspectRatio: 1,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    maxWidth: '16%', // 6 sütun için limit
    borderWidth: 1,
    borderColor: 'transparent'
  },
  // AVATAR MODAL STYLES
  avatarSheet: {
    backgroundColor: "#FFF",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    height: '65%',
    maxHeight: '65%',
  },
  avatarSheetHandle: {
    width: 36,
    height: 4,
    backgroundColor: Colors.gray[300],
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: 10,
    marginBottom: 12,
  },
  avatarHeroSection: {
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray[100],
  },
  avatarHeroCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },
  avatarHeroName: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.gray[800],
    marginBottom: 8,
  },
  randomButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: Colors.primary + '10',
    borderRadius: 16,
  },
  randomButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.primary,
  },
  segmentedControl: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginTop: 12,
    backgroundColor: Colors.gray[100],
    borderRadius: 10,
    padding: 3,
  },
  segmentTab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 8,
    borderRadius: 8,
  },
  segmentTabActive: {
    backgroundColor: Colors.primary,
  },
  segmentTabText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.gray[500],
  },
  segmentTabTextActive: {
    color: '#FFF',
  },
  avatarContentArea: {
    flex: 1,
    paddingTop: 12,
  },
  colorTabContent: {
    flex: 0,
  },
  categoryChipsContainer: {
    paddingHorizontal: 16,
    gap: 8,
    marginBottom: 10,
    height: 32,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    height: 32,
    paddingHorizontal: 10,
    backgroundColor: Colors.gray[100],
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.gray[200],
  },
  categoryChipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  categoryChipDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  categoryChipText: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.gray[600],
    lineHeight: 14,
  },
  categoryChipTextActive: {
    color: '#FFF',
  },
  colorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    gap: 10,
  },
  colorItem: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  colorItemSelected: {
    borderWidth: 3,
    borderColor: '#FFF',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 4,
  },
  colorCheckmark: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconGridContainer: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  iconGridRow: {
    gap: 8,
    marginBottom: 8,
  },
  iconItem: {
    flex: 1,
    aspectRatio: 1,
    maxWidth: '18.5%',
    borderRadius: 12,
    backgroundColor: Colors.gray[100],
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  editBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: Colors.secondary,
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFF'
  },
});