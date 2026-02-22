import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Modal,
  Pressable,
  TextInput,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "../../constants/colors";
import { useTranslation } from "react-i18next";

interface ConfirmDeleteModalProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  type: "data" | "account";
}

export default function ConfirmDeleteModal({
  visible,
  onClose,
  onConfirm,
  type,
}: ConfirmDeleteModalProps) {
  const { t } = useTranslation();
  const [inputValue, setInputValue] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const confirmWord = t("settings.delete_confirm_word");
  const isMatch = inputValue.trim().toLowerCase() === confirmWord.toLowerCase();

  useEffect(() => {
    if (!visible) {
      setInputValue("");
      setLoading(false);
      setError("");
      setSuccess(false);
    }
  }, [visible]);

  const handleConfirm = async () => {
    if (!isMatch) return;
    setLoading(true);
    setError("");
    try {
      await onConfirm();
      setSuccess(true);
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (e: any) {
      const needsReauth =
        e?.code === "auth/requires-recent-login";
      setError(
        needsReauth
          ? t("settings.delete_reauth_error")
          : t("settings.delete_error")
      );
    } finally {
      setLoading(false);
    }
  };

  const title =
    type === "data"
      ? t("settings.delete_data_title")
      : t("settings.delete_account_title");

  const description =
    type === "data"
      ? t("settings.delete_data_desc")
      : t("settings.delete_account_desc");

  const iconName = type === "data" ? "trash-outline" : "person-remove-outline";
  const accentColor = type === "data" ? "#F59E0B" : "#DC2626";

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.overlay}
      >
        <Pressable style={styles.backdrop} onPress={onClose} />
        <View style={styles.container}>
          {success ? (
            <View style={styles.successContent}>
              <View style={[styles.successIcon, { backgroundColor: "#F0FDF4" }]}>
                <Ionicons name="checkmark-circle" size={48} color="#16A34A" />
              </View>
              <Text style={styles.successText}>
                {type === "data"
                  ? t("settings.delete_data_success")
                  : t("settings.delete_account_success")}
              </Text>
            </View>
          ) : (
            <>
              {/* Header */}
              <View style={styles.header}>
                <View
                  style={[
                    styles.iconCircle,
                    { backgroundColor: accentColor + "15" },
                  ]}
                >
                  <Ionicons
                    name={iconName as any}
                    size={28}
                    color={accentColor}
                  />
                </View>
                <Pressable
                  style={styles.closeBtn}
                  onPress={onClose}
                  hitSlop={8}
                >
                  <Ionicons
                    name="close"
                    size={22}
                    color={Colors.gray[400]}
                  />
                </Pressable>
              </View>

              {/* Content */}
              <Text style={styles.title}>{title}</Text>
              <Text style={styles.description}>{description}</Text>

              {/* Warning Box */}
              <View style={[styles.warningBox, { borderColor: accentColor + "40" }]}>
                <Ionicons
                  name="warning-outline"
                  size={18}
                  color={accentColor}
                />
                <Text style={[styles.warningText, { color: accentColor }]}>
                  {t("settings.delete_warning")}
                </Text>
              </View>

              {/* Confirmation Input */}
              <Text style={styles.inputLabel}>
                {t("settings.delete_type_to_confirm", {
                  word: confirmWord,
                })}
              </Text>
              <View
                style={[
                  styles.inputBox,
                  isMatch && styles.inputBoxMatch,
                ]}
              >
                <TextInput
                  style={styles.input}
                  value={inputValue}
                  onChangeText={setInputValue}
                  placeholder={confirmWord}
                  placeholderTextColor={Colors.gray[300]}
                  autoCapitalize="none"
                  autoCorrect={false}
                  editable={!loading}
                />
                {isMatch && (
                  <Ionicons
                    name="checkmark-circle"
                    size={20}
                    color="#16A34A"
                  />
                )}
              </View>

              {error ? (
                <View style={styles.errorBox}>
                  <Ionicons
                    name="alert-circle"
                    size={16}
                    color="#DC2626"
                  />
                  <Text style={styles.errorText}>{error}</Text>
                </View>
              ) : null}

              {/* Buttons */}
              <View style={styles.buttons}>
                <Pressable
                  style={styles.cancelBtn}
                  onPress={onClose}
                  disabled={loading}
                >
                  <Text style={styles.cancelBtnText}>
                    {t("common.cancel")}
                  </Text>
                </Pressable>
                <Pressable
                  style={[
                    styles.confirmBtn,
                    { backgroundColor: accentColor },
                    (!isMatch || loading) && styles.btnDisabled,
                  ]}
                  onPress={handleConfirm}
                  disabled={!isMatch || loading}
                >
                  {loading ? (
                    <ActivityIndicator color="#FFF" size="small" />
                  ) : (
                    <Text style={styles.confirmBtnText}>
                      {type === "data"
                        ? t("settings.delete_data_btn")
                        : t("settings.delete_account_btn")}
                    </Text>
                  )}
                </Pressable>
              </View>
            </>
          )}
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  container: {
    width: "88%",
    maxWidth: 400,
    backgroundColor: "#FFF",
    borderRadius: 20,
    padding: 24,
    elevation: 10,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 20,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 16,
  },
  iconCircle: {
    width: 56,
    height: 56,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.gray[100],
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    color: Colors.secondary,
    marginBottom: 8,
  },
  description: {
    fontSize: 13,
    color: Colors.gray[500],
    lineHeight: 20,
    marginBottom: 16,
  },
  warningBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#FFFBEB",
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
  },
  warningText: {
    flex: 1,
    fontSize: 12,
    fontWeight: "600",
    lineHeight: 18,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: Colors.secondary,
    marginBottom: 8,
  },
  inputBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.gray[50],
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: Colors.gray[200],
    paddingHorizontal: 14,
    height: 48,
    marginBottom: 12,
  },
  inputBoxMatch: {
    borderColor: "#16A34A",
    backgroundColor: "#F0FDF4",
  },
  input: {
    flex: 1,
    fontSize: 15,
    fontWeight: "600",
    color: Colors.secondary,
  },
  errorBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 12,
  },
  errorText: {
    fontSize: 12,
    color: "#DC2626",
    fontWeight: "500",
  },
  buttons: {
    flexDirection: "row",
    gap: 10,
    marginTop: 4,
  },
  cancelBtn: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    backgroundColor: Colors.gray[100],
    alignItems: "center",
    justifyContent: "center",
  },
  cancelBtnText: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.gray[600],
  },
  confirmBtn: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  confirmBtnText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#FFF",
  },
  btnDisabled: {
    opacity: 0.4,
  },
  successContent: {
    alignItems: "center",
    paddingVertical: 20,
  },
  successIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  successText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#16A34A",
    textAlign: "center",
  },
});
