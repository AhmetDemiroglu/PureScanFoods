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
  PanResponder
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { Colors } from "../../constants/colors";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import {
  getAllDietTypes,
  DietType,
  getDietDefinition,
  DIET_DEFINITIONS
} from "../../lib/diets";
import {
  getAllAllergenTypes,
  AllergenType,
  getAllergenDefinition,
  ALLERGEN_DEFINITIONS
} from "../../lib/allergens";

if (Platform.OS === 'android') {
  if (UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
  }
}

// --- AVATAR ASSETS ---
const AVATAR_COLORS = ["#F59E0B", "#EA580C", "#DC2626", "#DB2777", "#9333EA", "#4F46E5", "#2563EB", "#0284C7", "#059669", "#65A30D"];
const AVATAR_ICONS: (keyof typeof Ionicons.glyphMap)[] = [
  "person", "woman", "man", "happy", "glasses", "body",
  "heart", "star", "leaf", "rose", "flame", "water",
  "barbell", "bicycle", "football", "tennisball", "paw", "fish",
  "restaurant", "nutrition", "cafe", "beer", "game-controller", "rocket"
];

type FamilyRole = "myself" | "spouse" | "child" | "mother" | "father" | "sibling" | "friend" | "other";

interface UserProfileData {
  diet: DietType | null;
  allergens: AllergenType[];
}

interface FamilyMember {
  id: string;
  name: string;
  role: FamilyRole;
  color: string;
  avatarIcon: keyof typeof Ionicons.glyphMap;
}

export default function NutritionScreen() {
  const router = useRouter();
  const { t, i18n } = useTranslation();
  const isTr = i18n.language === "tr";
  const insets = useSafeAreaInsets();

  // --- PAN RESPONDER ---
  const panResponder = React.useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gestureState) => gestureState.dy > 5, // Sadece aşağı hareket
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dy > 50) {
          setShowFamilyModal(false);
          setShowDietModal(false);
          setShowAllergenModal(false);
          setShowAvatarModal(false);
        }
      },
    })
  ).current;

  // --- STATE ---
  const [isEditingProfile, setIsEditingProfile] = useState(false);

  // Beslenme State'leri
  const [isDietExpanded, setIsDietExpanded] = useState(false);
  const [expandedAllergens, setExpandedAllergens] = useState<string[]>([]);

  // Aile ve Profil Verileri
  const [activeProfileId, setActiveProfileId] = useState<string>("main_user");
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([
    { id: "main_user", name: "Ahmet Demiroğlu", role: "myself", color: Colors.primary, avatarIcon: "person" }
  ]);
  const [profilesData, setProfilesData] = useState<Record<string, UserProfileData>>({
    "main_user": { diet: null, allergens: [] }
  });

  // Modallar
  const [showFamilyModal, setShowFamilyModal] = useState(false);
  const [showDietModal, setShowDietModal] = useState(false);
  const [showAllergenModal, setShowAllergenModal] = useState(false);
  const [showAvatarModal, setShowAvatarModal] = useState(false); // Yeni Avatar Modalı

  // Geçici State (Modal formları)
  const [newMemberName, setNewMemberName] = useState("");
  const [newMemberRole, setNewMemberRole] = useState<FamilyRole>("child");
  const [editingAvatarId, setEditingAvatarId] = useState<string | null>(null);

  // --- HELPERS ---
  const activeUser = familyMembers.find(m => m.id === activeProfileId) || familyMembers[0];
  const activeData = profilesData[activeProfileId] || { diet: null, allergens: [] };
  const selectedDiet = activeData.diet;
  const userAllergens = activeData.allergens;

  const updateProfileData = (key: keyof UserProfileData, value: any) => {
    setProfilesData(prev => ({
      ...prev,
      [activeProfileId]: { ...prev[activeProfileId], [key]: value }
    }));
  };

  // --- HANDLERS ---
  const handleNameChange = (text: string) => {
    setFamilyMembers(prev => prev.map(m => m.id === "main_user" ? { ...m, name: text } : m));
  };

  const updateMemberAvatar = (id: string, color: string, icon: keyof typeof Ionicons.glyphMap) => {
    setFamilyMembers(prev => prev.map(m => m.id === id ? { ...m, color, avatarIcon: icon } : m));
  };

  const openAvatarSelector = (id: string) => {
    setEditingAvatarId(id);
    setShowAvatarModal(true);
  };

  const addFamilyMember = () => {
    if (!newMemberName.trim()) return;

    const icons: Record<string, keyof typeof Ionicons.glyphMap> = {
      spouse: "heart",
      child: "happy",
      mother: "woman",
      father: "man",
      sibling: "people",
      friend: "beer",
      other: "person",
      myself: "person"
    };

    const newMember: FamilyMember = {
      id: Date.now().toString(),
      name: newMemberName,
      role: newMemberRole,
      color: AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)],
      avatarIcon: icons[newMemberRole] || "person"
    };

    setProfilesData(prev => ({ ...prev, [newMember.id]: { diet: null, allergens: [] } }));
    setFamilyMembers([...familyMembers, newMember]);
    setNewMemberName("");
    setNewMemberRole("child");
    setShowFamilyModal(false);
  };

  const toggleAllergenSelection = (type: AllergenType) => {
    const current = activeData.allergens;
    const updated = current.includes(type) ? current.filter(a => a !== type) : [...current, type];
    updateProfileData("allergens", updated);
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
            <TouchableOpacity
              style={[styles.avatarBox, { backgroundColor: familyMembers.find(m => m.id === "main_user")?.color }]}
              onPress={() => openAvatarSelector("main_user")}
            >
              <Ionicons name={familyMembers.find(m => m.id === "main_user")?.avatarIcon || "person"} size={24} color="#FFF" />
              <View style={styles.premiumBadge}>
                <Ionicons name="star" size={10} color="#FFF" />
              </View>
            </TouchableOpacity>

            <View style={{ flex: 1, justifyContent: 'center' }}>
              {isEditingProfile ? (
                <TextInput
                  style={styles.profileInput}
                  value={familyMembers.find(m => m.id === "main_user")?.name}
                  onChangeText={handleNameChange}
                  onBlur={() => setIsEditingProfile(false)}
                  autoFocus
                  selectionColor="#FFF"
                />
              ) : (
                <TouchableOpacity onPress={() => setIsEditingProfile(true)} style={styles.nameRow}>
                  <Text style={styles.profileName}>{familyMembers.find(m => m.id === "main_user")?.name}</Text>
                  <Ionicons name="pencil" size={14} color="rgba(255,255,255,0.7)" />
                </TouchableOpacity>
              )}
              <Text style={styles.profileRole}>{isTr ? "Premium Üye" : "Premium Member"}</Text>
            </View>
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
            <TouchableOpacity onPress={() => setShowFamilyModal(true)} style={styles.actionButton}>
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
                >
                  <View style={[styles.memberAvatar, { backgroundColor: member.color }]}>
                    <Ionicons name={member.avatarIcon} size={20} color="#FFF" />
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
          <View style={[styles.bottomSheet, { paddingBottom: insets.bottom + 20 }]} {...panResponder.panHandlers}>
            <View style={styles.bottomSheetHandle} />
            <View style={styles.sheetHeader}>
              <Text style={styles.sheetTitle}>{t("nutrition.family.add")}</Text>
              <TouchableOpacity onPress={() => setShowFamilyModal(false)} style={styles.closeButton}>
                <Ionicons name="close" size={20} color={Colors.gray[500]} />
              </TouchableOpacity>
            </View>
            <View style={{ padding: 20 }}>
              <Text style={styles.inputLabel}>{t("nutrition.family.inputName")}</Text>
              <TextInput
                style={styles.modalInput}
                placeholder="Örn: Ali"
                placeholderTextColor="#94A3B8"
                value={newMemberName}
                onChangeText={setNewMemberName}
              />
              <Text style={styles.inputLabel}>{t("nutrition.family.selectRole")}</Text>
              <View style={styles.roleContainer}>
                {["spouse", "child", "mother", "father", "sibling", "friend", "other"].map((role) => (
                  <TouchableOpacity
                    key={role}
                    style={[styles.roleChip, newMemberRole === role && styles.roleChipActive]}
                    onPress={() => setNewMemberRole(role as FamilyRole)}
                  >
                    <Text style={[styles.roleText, newMemberRole === role && { color: '#FFF' }]}>
                      {t(`nutrition.family.roles.${role}`)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              <TouchableOpacity style={styles.saveButton} onPress={addFamilyMember}>
                <Text style={styles.saveButtonText}>{t("nutrition.family.save")}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* 2. DIET MODAL */}
      <Modal visible={showDietModal} transparent animationType="fade" onRequestClose={() => setShowDietModal(false)}>
        <View style={styles.modalOverlay}>
          <Pressable style={styles.modalDismiss} onPress={() => setShowDietModal(false)} />
          <View style={[styles.bottomSheet, { paddingBottom: insets.bottom + 20 }]} {...panResponder.panHandlers}>
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
                    onPress={() => { updateProfileData("diet", item); setShowDietModal(false); }}
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
          </View>
        </View>
      </Modal>

      {/* 3. ALLERGEN MODAL */}
      <Modal visible={showAllergenModal} transparent animationType="fade" onRequestClose={() => setShowAllergenModal(false)}>
        <View style={styles.modalOverlay}>
          <Pressable style={styles.modalDismiss} onPress={() => setShowAllergenModal(false)} />
          <View style={[styles.bottomSheet, { paddingBottom: insets.bottom + 20 }]} {...panResponder.panHandlers}>
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
          </View>
        </View>
      </Modal>

      {/* 4. AVATAR BUILDER MODAL (NEW) */}
      <Modal visible={showAvatarModal} transparent animationType="fade" onRequestClose={() => setShowAvatarModal(false)}>
        <View style={styles.modalOverlay}>
          <Pressable style={styles.modalDismiss} onPress={() => setShowAvatarModal(false)} />
          <View style={[styles.bottomSheet, { paddingBottom: insets.bottom + 20, height: 'auto', maxHeight: '60%' }]} {...panResponder.panHandlers}>
            <View style={styles.bottomSheetHandle} />
            <View style={styles.sheetHeader}>
              <Text style={styles.sheetTitle}>{isTr ? "Profil Avatarı" : "Profile Avatar"}</Text>
              <TouchableOpacity onPress={() => setShowAvatarModal(false)} style={styles.closeButton}>
                <Ionicons name="close" size={20} color={Colors.gray[500]} />
              </TouchableOpacity>
            </View>

            <View style={{ padding: 20 }}>
              {/* Renk Seçimi */}
              <Text style={styles.inputLabel}>{isTr ? "Renk Seç" : "Choose Color"}</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 12, marginBottom: 20 }}>
                {AVATAR_COLORS.map(color => (
                  <TouchableOpacity
                    key={color}
                    style={[styles.colorCircle, { backgroundColor: color }, editingAvatarId && familyMembers.find(m => m.id === editingAvatarId)?.color === color && styles.colorCircleActive]}
                    onPress={() => {
                      if (editingAvatarId) updateMemberAvatar(editingAvatarId, color, familyMembers.find(m => m.id === editingAvatarId)?.avatarIcon || "person");
                    }}
                  />
                ))}
              </ScrollView>

              {/* İkon Seçimi */}
              <Text style={styles.inputLabel}>{isTr ? "Karakter Seç" : "Choose Character"}</Text>
              <View style={{ height: 200 }}>
                <FlatList
                  data={AVATAR_ICONS}
                  keyExtractor={(item) => item}
                  numColumns={6}
                  contentContainerStyle={{ gap: 12 }}
                  columnWrapperStyle={{ gap: 12 }}
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      style={[styles.iconBox, editingAvatarId && familyMembers.find(m => m.id === editingAvatarId)?.avatarIcon === item && { backgroundColor: Colors.gray[200] }]}
                      onPress={() => {
                        if (editingAvatarId) updateMemberAvatar(editingAvatarId, familyMembers.find(m => m.id === editingAvatarId)?.color || Colors.primary, item);
                      }}
                    >
                      <Ionicons name={item} size={24} color={Colors.secondary} />
                    </TouchableOpacity>
                  )}
                />
              </View>
            </View>
          </View>
        </View>
      </Modal>

    </View>
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
  colorCircle: { width: 40, height: 40, borderRadius: 20, borderWidth: 2, borderColor: '#FFF' },
  colorCircleActive: { borderColor: Colors.secondary, borderWidth: 3 },
  iconBox: { width: 48, height: 48, borderRadius: 12, backgroundColor: "#F1F5F9", alignItems: 'center', justifyContent: 'center' },
});