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
  Dimensions,
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
  getAllLifeStageTypes,
  getLifeStageDefinition,
  LIFESTAGE_DEFINITIONS,
  LifeStageType
} from "../../lib/lifestages";
import {
  getAllAllergenTypes,
  AllergenType,
  getAllergenDefinition,
  ALLERGEN_DEFINITIONS
} from "../../lib/allergens";
import {
  useUser,
  FamilyRole,
  AVATAR_COLORS,
  AVATAR_ICONS,
  AVATAR_COLOR_CATEGORIES,
  AVATAR_ICON_CATEGORIES
} from "../../context/UserContext";
import * as Haptics from "expo-haptics";
import { useAuth } from "../../context/AuthContext";
import LimitWarningModal from "../../components/ui/LimitWarningModal";
import HistorySidebar from "../history";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { OnboardingModal } from "../../components/ui/OnboardingModal";
import PaywallModal from "../../components/ui/PaywallModal";

const getSafeIcon = (iconName: string): any => iconName === "person" ? "account" : iconName;

if (Platform.OS === 'android' && !(global as any).nativeFabricUIManager) {
  if (UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
  }
}

type AvatarIconName = keyof typeof MaterialCommunityIcons.glyphMap;

export default function NutritionScreen() {
  const { userProfile, user, usageStats } = useAuth();
  const isPremium = userProfile?.subscriptionStatus === "premium" || false;
  const router = useRouter();
  const { t, i18n } = useTranslation();
  const isTr = i18n.language === "tr";
  const insets = useSafeAreaInsets();

  // --- ANIMATED PAN RESPONDER ---
  const panY = React.useRef(new Animated.Value(0)).current;

  const panResponder = React.useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return gestureState.dy > 5;
      },
      onPanResponderMove: (_, gestureState) => {
        if (gestureState.dy > 0) {
          panY.setValue(gestureState.dy);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dy > 120 || gestureState.vy > 0.6) {
          // Direkt kapat - animation yok
          setShowFamilyModal(false);
          setShowDietModal(false);
          setShowAllergenModal(false);
          setShowAvatarModal(false);
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

  const mainUserRef = familyMembers.find(m => m.id === "main_user");

  React.useEffect(() => {
    if (user?.displayName && mainUserRef && user?.email) {
      const currentName = mainUserRef.name || "";
      const emailPrefix = user.email.split('@')[0];

      const isInvalid =
        !currentName.trim() ||
        currentName === emailPrefix ||
        currentName.includes('@');

      if (isInvalid) {
        updateMemberInfo("main_user", { name: user.displayName });
      }
    }
  }, [user?.displayName, mainUserRef?.name, user?.email]);

  const [tempName, setTempName] = useState("");
  const [tempRole, setTempRole] = useState<FamilyRole>("child");
  const [tempColor, setTempColor] = useState(Colors.primary);
  const [tempIcon, setTempIcon] = useState<string>("account");
  const [tempLifeStage, setTempLifeStage] = useState<LifeStageType>("ADULT");

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

  // Limit Warning Modal State
  const [showLimitModal, setShowLimitModal] = useState(false);
  const [showPaywall, setShowPaywall] = useState(false);
  const [isHistoryOpen, setHistoryOpen] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);

  React.useEffect(() => {
    AsyncStorage.getItem("@nutrition_onboarding_shown_v1").then(shown => {
      if (shown !== "true") setShowOnboarding(true);
    });
  }, []);

  const handleOnboardingFinish = async () => {
    await AsyncStorage.setItem("@nutrition_onboarding_shown_v1", "true");
    setShowOnboarding(false);
  };

  const nutritionSlides = React.useMemo(() => [
    {
      title: t("nutrition.onboarding.slide1Title"),
      desc: t("nutrition.onboarding.slide1Desc"),
      icon: "heart" as const,
      iconColor: Colors.primary,
      iconBg: "#FFF7ED",
    },
    {
      title: t("nutrition.onboarding.slide2Title"),
      desc: t("nutrition.onboarding.slide2Desc"),
      icon: "people" as const,
      iconColor: "#0284C7",
      iconBg: "#E0F2FE",
    },
    {
      title: t("nutrition.onboarding.slide3Title"),
      desc: t("nutrition.onboarding.slide3Desc"),
      icon: "shield-checkmark" as const,
      iconColor: "#16A34A",
      iconBg: "#F0FDF4",
    },
  ], [t]);

  React.useEffect(() => {
    if (showFamilyModal || showDietModal || showAllergenModal || showAvatarModal) {
      panY.stopAnimation();
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
    if (!isPremium && familyMembers.length >= 2) {
      setShowLimitModal(true);
      return;
    }
    setEditingMemberId(null);
    setTempName("");
    setTempRole("child");
    setTempColor(AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)]);
    setTempIcon("account");
    setTempLifeStage("CHILD_3_12");
    setShowFamilyModal(true);
  };

  const openEditModal = (member: any) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setEditingMemberId(member.id);
    setTempName(member.name);
    setTempRole(member.role);
    setTempColor(member.color);
    setTempIcon(member.avatarIcon);
    setTempLifeStage(member.lifeStage || "ADULT");
    setShowFamilyModal(true);
  };

  const handleMemberPress = (member: any) => {
    setActiveProfileId(member.id);
  };

  const handleMemberLongPress = (member: any) => {
    openEditModal(member);
  };

  const handleSaveMember = () => {
    if (!tempName.trim()) return;

    if (editingMemberId) {
      updateMemberInfo(editingMemberId, {
        name: tempName,
        role: tempRole,
        color: tempColor,
        avatarIcon: tempIcon,
        lifeStage: tempLifeStage
      });
    } else {
      contextAddMember(tempName, tempRole, tempIcon, tempColor, tempLifeStage);
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
      return;
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
            <TouchableOpacity style={styles.infoButton} onPress={() => setShowOnboarding(true)}>
              <Ionicons name="information-circle-outline" size={18} color="rgba(255,255,255,0.7)" />
            </TouchableOpacity>
            <TouchableOpacity style={[styles.backButton, { marginRight: 0 }]} onPress={() => setHistoryOpen(true)}>
              <MaterialCommunityIcons name="history" size={22} color="#FFF" />
            </TouchableOpacity>
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

                    {/* Sadece Premium ise yıldız göster */}
                    {isPremium && (
                      <View style={styles.premiumBadge}>
                        <Ionicons name="star" size={10} color="#FFF" />
                      </View>
                    )}
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
                    {/* Üyelik Metni */}
                    <Text style={styles.profileRole}>
                      {isPremium ? t("nutrition.premium_member") : t("nutrition.standard_member")}
                    </Text>
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
                  onPress={() => handleMemberPress(member)}
                  onLongPress={() => handleMemberLongPress(member)}
                  delayLongPress={400}
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
          {familyMembers.length > 1 && (
            <View style={styles.hintRow}>
              <Ionicons name="information-circle-outline" size={14} color={Colors.gray[400]} />
              <Text style={styles.hintText}>{t("nutrition.hints.longPressEdit")}</Text>
            </View>
          )}
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

      {/* 1. FAMILY ADD/EDIT MODAL - YENİLENMİŞ TASARIM */}
      <Modal
        visible={showFamilyModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowFamilyModal(false)}
      >
        <View style={styles.modalOverlay}>
          <Pressable style={styles.modalDismiss} onPress={() => setShowFamilyModal(false)} />

          <Animated.View
            style={[
              styles.bottomSheet,
              { maxHeight: '85%' }, // Biraz daha alan açtık
              { transform: [{ translateY: panY }] }
            ]}
          >
            {/* HANDLE & HEADER */}
            <View
              {...panResponder.panHandlers}
              style={styles.headerDraggableArea}
            >
              <View style={styles.bottomSheetHandle} />
              <View style={styles.sheetHeaderCompact}>
                <Text style={styles.sheetTitle}>
                  {editingMemberId ? (editingMemberId === 'main_user' ? t("nutrition.profile") : t("nutrition.family.edit")) : t("nutrition.family.add")}
                </Text>
                <TouchableOpacity
                  onPress={() => setShowFamilyModal(false)}
                  style={styles.closeButtonIcon}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }} // Tıklama alanını genişlettik
                >
                  <Ionicons name="close" size={20} color={Colors.gray[500]} />
                </TouchableOpacity>
              </View>
            </View>

            {/* SCROLLABLE FORM CONTENT */}
            <ScrollView
              contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 3, paddingBottom: 3 }}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >

              {/* AVATAR SECTION */}
              <View style={styles.avatarSection}>
                <TouchableOpacity
                  style={styles.avatarEditContainer}
                  onPress={editingMemberId ? openAvatarSelectorForEdit : undefined}
                  activeOpacity={0.8}
                >
                  <View style={[styles.avatarDisplayBig, { backgroundColor: tempColor }]}>
                    <MaterialCommunityIcons name={getSafeIcon(tempIcon) as any} size={40} color="#FFF" />
                  </View>
                  {!!editingMemberId && (
                    <View style={styles.avatarEditBadge}>
                      <Ionicons name="camera" size={12} color="#FFF" />
                    </View>
                  )}
                </TouchableOpacity>
                {!editingMemberId && (
                  <Text style={styles.avatarHintText}>{t("nutrition.family.avatarHint", "Avatar oluşturulduktan sonra düzenlenebilir")}</Text>
                )}
              </View>

              {/* INPUT: NAME */}
              <View style={styles.inputGroup}>
                <Text style={styles.labelSmall}>{t("nutrition.family.inputName")}</Text>
                <View style={styles.inputWrapper}>
                  <Ionicons name="person-outline" size={20} color={Colors.gray[400]} style={{ marginLeft: 12 }} />
                  <TextInput
                    style={styles.textInputClean}
                    value={tempName}
                    onChangeText={setTempName}
                    placeholder={t("nutrition.family.namePlaceholder", "Örn: Ali")}
                    placeholderTextColor={Colors.gray[400]}
                  />
                </View>
              </View>

              {/* SELECTOR: ROLE */}
              {editingMemberId !== 'main_user' && (
                <View style={styles.inputGroup}>
                  <Text style={styles.labelSmall}>{t("nutrition.family.selectRole")}</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 10, paddingRight: 20 }}>
                    {["spouse", "child", "mother", "father", "sibling", "friend", "other"].map((role) => {
                      const isSelected = tempRole === role;
                      // Rol ikonlarını basitçe eşleyelim (Daha fazlası eklenebilir)
                      let iconName = "account-outline";
                      if (role === 'mother') iconName = "face-woman";
                      if (role === 'father') iconName = "face-man";
                      if (role === 'child') iconName = "baby-face-outline";

                      return (
                        <TouchableOpacity
                          key={role}
                          style={[styles.roleCard, isSelected && styles.roleCardActive]}
                          onPress={() => setTempRole(role as FamilyRole)}
                          activeOpacity={0.7}
                        >
                          <MaterialCommunityIcons
                            name={iconName as any}
                            size={20}
                            color={isSelected ? Colors.primary : Colors.gray[500]}
                          />
                          <Text style={[styles.roleCardText, isSelected && styles.roleCardTextActive]}>
                            {t(`nutrition.family.roles.${role}`, role)}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </ScrollView>
                </View>
              )}

              {/* SELECTOR: LIFE STAGE */}
              <View style={styles.inputGroup}>
                <Text style={styles.labelSmall}>{t("nutrition.family.selectLifeStage", "Yaş & Durum")}</Text>
                <View style={styles.lifeStageGrid}>
                  {getAllLifeStageTypes().map((stage) => {
                    const def = LIFESTAGE_DEFINITIONS[stage];
                    const isSelected = tempLifeStage === stage;
                    const isVulnerable = ['INFANT_0_6', 'INFANT_6_12', 'TODDLER_1_3', 'PREGNANT'].includes(stage);
                    const activeBorder = isVulnerable ? "#F59E0B" : Colors.primary;
                    const activeBg = isVulnerable ? "#FEF3C7" : "#EFF6FF";
                    const activeText = isVulnerable ? "#B45309" : Colors.primary;

                    return (
                      <TouchableOpacity
                        key={stage}
                        style={[
                          styles.lifeStageItem,
                          isSelected && { borderColor: activeBorder, backgroundColor: activeBg }
                        ]}
                        onPress={() => setTempLifeStage(stage)}
                        activeOpacity={0.7}
                      >
                        <Text style={[styles.lifeStageText, isSelected && { color: activeText, fontWeight: '700' }]}>
                          {isTr ? def.nameTr : def.name}
                        </Text>
                        {isVulnerable && (
                          <Ionicons name="warning" size={10} color="#F59E0B" style={{ position: 'absolute', top: 4, right: 4 }} />
                        )}
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>

              {/* Vulnerable Warning Box */}
              {['INFANT_0_6', 'INFANT_6_12', 'TODDLER_1_3', 'PREGNANT'].includes(tempLifeStage) && (
                <View style={styles.warningBox}>
                  <Ionicons name="alert-circle" size={20} color="#B45309" />
                  <Text style={styles.warningText}>
                    {t("nutrition.lifeStageWarning", "Bu yaş grubu için beslenme analizlerinde özel kısıtlamalar dikkate alınacaktır.")}
                  </Text>
                </View>
              )}

            </ScrollView>

            {/* FIXED FOOTER BUTTONS */}
            <SafeAreaView style={[styles.modalFooter]}>
              {!!editingMemberId && editingMemberId !== 'main_user' && (
                <TouchableOpacity
                  style={styles.buttonDelete}
                  onPress={handleDeleteMember}
                >
                  <Ionicons name="trash-outline" size={22} color="#EF4444" />
                </TouchableOpacity>
              )}

              {/* SAVE BUTTON */}
              <TouchableOpacity
                style={[
                  styles.buttonSave,
                  !tempName.trim() && styles.buttonDisabled
                ]}
                onPress={handleSaveMember}
                disabled={!tempName.trim()}
              >
                <Text style={styles.buttonSaveText}>
                  {editingMemberId ? t("nutrition.family.update") : t("nutrition.family.save")}
                </Text>
                <Ionicons name="checkmark" size={20} color="#FFF" />
              </TouchableOpacity>
            </SafeAreaView>

          </Animated.View>
        </View>
      </Modal>

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
          >
            <View {...panResponder.panHandlers} style={{ paddingBottom: 8 }}>
              <View style={styles.bottomSheetHandle} />
            </View>
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
              ListHeaderComponent={selectedDiet ? (
                <TouchableOpacity
                  style={styles.clearDietButton}
                  onPress={() => {
                    contextUpdateData(activeProfileId, "diet", null);
                    setShowDietModal(false);
                  }}
                >
                  <Ionicons name="close-circle-outline" size={20} color={Colors.error} />
                  <Text style={styles.clearDietText}>{t("nutrition.clearDiet")}</Text>
                </TouchableOpacity>
              ) : null}
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
          >
            <View {...panResponder.panHandlers} style={{ paddingBottom: 8 }}>
              <View style={styles.bottomSheetHandle} />
            </View>
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
          >
            {/* Handle */}
            <View {...panResponder.panHandlers} style={{ paddingBottom: 8 }}>
              <View style={styles.avatarSheetHandle} />
            </View>

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
      <HistorySidebar visible={isHistoryOpen} onClose={() => setHistoryOpen(false)} />
      <OnboardingModal
        visible={showOnboarding}
        onFinish={handleOnboardingFinish}
        slides={nutritionSlides}
        nextLabel={t("nutrition.onboarding.nextBtn")}
        finishLabel={t("nutrition.onboarding.finishBtn")}
      />
      <LimitWarningModal
        visible={showLimitModal}
        onClose={() => setShowLimitModal(false)}
        onGoPremium={() => {
          setShowLimitModal(false);
          setShowPaywall(true);
        }}
        stats={usageStats}
        user={{
          ...userProfile,
          familyMembers: familyMembers
        }}
        limitType="family"
      />
      <PaywallModal
        visible={showPaywall}
        onClose={() => setShowPaywall(false)}
      />
    </View >
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8FAFC" },
  header: { paddingBottom: 20 },
  headerContent: { flexDirection: "row", alignItems: "center", paddingHorizontal: 20, paddingTop: 10, marginBottom: 16 },
  backButton: { width: 40, height: 40, borderRadius: 20, backgroundColor: "rgba(255,255,255,0.2)", alignItems: "center", justifyContent: "center", marginRight: 12 },
  infoButton: { width: 28, height: 28, borderRadius: 14, backgroundColor: "rgba(255,255,255,0.1)", alignItems: "center", justifyContent: "center", marginRight: 8 },
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
  hintRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 8, paddingLeft: 4 },
  hintText: { fontSize: 11, color: Colors.gray[400] },
  clearDietButton: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 14, paddingHorizontal: 4, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  clearDietText: { fontSize: 15, fontWeight: '600', color: Colors.error },

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
    borderWidth: 0
  },
  iconGridColumnWrapper: {
    gap: 8
  },
  iconBox: {
    flex: 1,
    aspectRatio: 1,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    maxWidth: '16%',
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
  headerDraggableArea: {
    paddingBottom: 10,
    backgroundColor: '#FFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  sheetHeaderCompact: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingBottom: 8,
  },
  closeButtonIcon: {
    padding: 6,
    backgroundColor: Colors.gray[100],
    borderRadius: 50,
  },

  // Avatar Section
  avatarSection: {
    alignItems: 'center',
    marginBottom: 20,
  },
  avatarEditContainer: {
    position: 'relative',
  },
  avatarDisplayBig: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  avatarEditBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: Colors.secondary,
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFF',
  },
  avatarHintText: {
    fontSize: 12,
    color: Colors.gray[400],
    marginTop: 10,
  },

  // Input Groups
  inputGroup: {
    marginBottom: 15,
  },
  labelSmall: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.gray[700],
    marginBottom: 8,
    marginLeft: 4,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.gray[50],
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.gray[200],
    height: 50,
  },
  textInputClean: {
    flex: 1,
    height: '100%',
    paddingHorizontal: 12,
    fontSize: 16,
    color: Colors.secondary,
    fontWeight: '500',
  },

  // Role Cards
  roleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: Colors.gray[200],
    minWidth: 100,
    justifyContent: 'center',
  },
  roleCardActive: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primary + '10', // %10 opacity hex sonuna ekleme tekniği yoksa rgba kullan
  },
  roleCardText: {
    fontSize: 14,
    color: Colors.gray[600],
    fontWeight: '500',
  },
  roleCardTextActive: {
    color: Colors.primary,
    fontWeight: '700',
  },

  // Life Stage Grid
  lifeStageGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  lifeStageItem: {
    width: '48%',
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderRadius: 12,
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: Colors.gray[200],
    alignItems: 'center',
  },
  lifeStageText: {
    fontSize: 13,
    color: Colors.gray[600],
    textAlign: 'center',
  },

  // Warning Box
  warningBox: {
    flexDirection: 'row',
    gap: 10,
    backgroundColor: '#FEF3C7',
    padding: 12,
    borderRadius: 12,
    marginBottom: 10,
  },
  warningText: {
    flex: 1,
    fontSize: 12,
    color: '#92400E',
    lineHeight: 18,
  },

  // Footer Buttons
  modalFooter: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.gray[100],
    backgroundColor: '#FFF',
    gap: 12,
  },
  buttonDelete: {
    width: 50,
    height: 50,
    borderRadius: 14,
    backgroundColor: '#FEF2F2',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  buttonSave: {
    flex: 1,
    height: 50,
    backgroundColor: Colors.primary,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  buttonDisabled: {
    backgroundColor: Colors.gray[300],
    shadowOpacity: 0,
    elevation: 0,
  },
  buttonSaveText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFF',
  },
});
