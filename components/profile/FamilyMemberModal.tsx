import React, { useMemo, useState, useEffect } from 'react';
import { View, Text, StyleSheet, Modal, TextInput, TouchableOpacity, ScrollView, Pressable } from 'react-native';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { AppColors } from '../../constants/colors';
import { AVATAR_ICONS, AVATAR_COLORS } from '../../context/UserContext';
import { useTheme } from '../../context/ThemeContext';
import { ComponentProps } from 'react';

type IconName = ComponentProps<typeof MaterialCommunityIcons>['name'];

interface FamilyMemberModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (name: string, icon: string, color: string) => void;
  onDelete?: () => void;
  initialData?: { name: string; icon: string; color: string } | null;
}

export default function FamilyMemberModal({ visible, onClose, onSave, onDelete, initialData }: FamilyMemberModalProps) {
  const { colors, isDark } = useTheme();
  const styles = useMemo(() => createStyles(colors, isDark), [colors, isDark]);
  const [name, setName] = useState('');
  const [selectedIcon, setSelectedIcon] = useState<IconName>(AVATAR_ICONS[0] as IconName);
  const [selectedColor, setSelectedColor] = useState(AVATAR_COLORS[0]);

  useEffect(() => {
    if (!visible) return;
    if (initialData) {
      setName(initialData.name);
      setSelectedIcon(initialData.icon as IconName);
      setSelectedColor(initialData.color);
    } else {
      setName('');
      setSelectedIcon(AVATAR_ICONS[0] as IconName);
      setSelectedColor(AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)]);
    }
  }, [visible, initialData]);

  const handleSave = () => {
    if (name.trim().length === 0) return;
    onSave(name.trim(), selectedIcon as string, selectedColor);
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.title}>{initialData ? 'Üyeyi Düzenle' : 'Yeni Aile Üyesi'}</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color={colors.gray[500]} />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            <Text style={styles.label}>İsim</Text>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder="Örn: Ali, Ayşe..."
              placeholderTextColor={colors.gray[400]}
            />

            <Text style={styles.label}>Avatar Seçin</Text>
            <View style={styles.grid}>
              {AVATAR_ICONS.map((icon) => (
                <TouchableOpacity
                  key={icon}
                  style={[
                    styles.iconItem,
                    selectedIcon === icon && { backgroundColor: selectedColor, borderColor: selectedColor },
                  ]}
                  onPress={() => setSelectedIcon(icon as IconName)}
                >
                  <MaterialCommunityIcons name={icon as IconName} size={24} color={selectedIcon === icon ? '#FFF' : colors.gray[400]} />
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.label}>Renk Seçin</Text>
            <View style={styles.colorRow}>
              {AVATAR_COLORS.map((color) => (
                <Pressable key={color} onPress={() => setSelectedColor(color)} style={[styles.colorItem, { backgroundColor: color }, selectedColor === color && styles.colorSelected]}>
                  {selectedColor === color && <Ionicons name="checkmark" size={16} color="#FFF" />}
                </Pressable>
              ))}
            </View>
          </ScrollView>

          <View style={styles.footer}>
            {initialData && onDelete ? (
              <TouchableOpacity style={styles.deleteBtn} onPress={onDelete}>
                <Ionicons name="trash-outline" size={20} color="#FFF" />
              </TouchableOpacity>
            ) : null}

            <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
              <Text style={styles.saveText}>{initialData ? 'Güncelle' : 'Kaydet'}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const createStyles = (colors: AppColors, isDark: boolean) =>
  StyleSheet.create({
    overlay: {
      flex: 1,
      justifyContent: 'flex-end',
      backgroundColor: colors.overlay,
    },
    container: {
      backgroundColor: colors.card,
      borderTopLeftRadius: 24,
      borderTopRightRadius: 24,
      padding: 20,
      maxHeight: '84%',
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 14,
    },
    title: {
      fontSize: 20,
      fontWeight: '700',
      color: colors.text,
    },
    label: {
      fontSize: 13,
      fontWeight: '700',
      color: colors.textMuted,
      marginTop: 12,
      marginBottom: 8,
    },
    input: {
      backgroundColor: colors.gray[100],
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 12,
      paddingHorizontal: 14,
      height: 48,
      fontSize: 15,
      color: colors.text,
    },
    grid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
    },
    iconItem: {
      width: 48,
      height: 48,
      borderRadius: 12,
      backgroundColor: colors.gray[100],
      borderWidth: 1,
      borderColor: colors.border,
      alignItems: 'center',
      justifyContent: 'center',
    },
    colorRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 10,
      marginTop: 4,
    },
    colorItem: {
      width: 30,
      height: 30,
      borderRadius: 15,
      alignItems: 'center',
      justifyContent: 'center',
    },
    colorSelected: {
      borderWidth: 2,
      borderColor: colors.white,
    },
    footer: {
      flexDirection: 'row',
      gap: 10,
      marginTop: 18,
    },
    deleteBtn: {
      width: 52,
      borderRadius: 12,
      backgroundColor: colors.error,
      alignItems: 'center',
      justifyContent: 'center',
    },
    saveBtn: {
      flex: 1,
      height: 52,
      borderRadius: 12,
      backgroundColor: colors.primary,
      alignItems: 'center',
      justifyContent: 'center',
    },
    saveText: {
      color: '#FFF',
      fontSize: 16,
      fontWeight: '700',
    },
  });

