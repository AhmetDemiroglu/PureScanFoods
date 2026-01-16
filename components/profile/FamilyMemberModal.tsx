import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Modal, TextInput, TouchableOpacity, ScrollView, Pressable } from 'react-native';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';
import { AVATAR_ICONS, AVATAR_COLORS } from '../../context/UserContext';
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
    const [name, setName] = useState('');
    const [selectedIcon, setSelectedIcon] = useState<IconName>(AVATAR_ICONS[0] as IconName);
    const [selectedColor, setSelectedColor] = useState(AVATAR_COLORS[0]);

    useEffect(() => {
        if (visible) {
            if (initialData) {
                setName(initialData.name);
                setSelectedIcon(initialData.icon as IconName);
                setSelectedColor(initialData.color);
            } else {
                setName('');
                setSelectedIcon(AVATAR_ICONS[0] as IconName);
                setSelectedColor(AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)]);
            }
        }
    }, [visible, initialData]);

    const handleSave = () => {
        if (name.trim().length === 0) return;
        onSave(name, selectedIcon, selectedColor);
        onClose();
    };

    return (
        <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
            <View style={styles.overlay}>
                <View style={styles.container}>

                    {/* Header */}
                    <View style={styles.header}>
                        <Text style={styles.title}>
                            {initialData ? "Üyeyi Düzenle" : "Yeni Aile Üyesi"}
                        </Text>
                        <TouchableOpacity onPress={onClose}>
                            <Ionicons name="close" size={24} color={Colors.gray[500]} />
                        </TouchableOpacity>
                    </View>

                    <ScrollView showsVerticalScrollIndicator={false}>
                        {/* 1. İsim Alanı */}
                        <Text style={styles.label}>İsim</Text>
                        <TextInput
                            style={styles.input}
                            value={name}
                            onChangeText={setName}
                            placeholder="Örn: Ali, Ayşe..."
                            placeholderTextColor={Colors.gray[400]}
                        />

                        {/* 2. Avatar Seçimi */}
                        <Text style={styles.label}>Avatar Seçin</Text>
                        <View style={styles.grid}>
                            {AVATAR_ICONS.map((icon) => (
                                <TouchableOpacity
                                    key={icon}
                                    style={[
                                        styles.iconItem,
                                        selectedIcon === icon && { backgroundColor: selectedColor, borderColor: selectedColor }
                                    ]}
                                    onPress={() => setSelectedIcon(icon)}
                                >
                                    <MaterialCommunityIcons
                                        name={icon as any}
                                        size={28}
                                        color={selectedIcon === icon ? '#FFF' : Colors.gray[400]}
                                    />
                                </TouchableOpacity>
                            ))}
                        </View>

                        {/* 3. Renk Seçimi */}
                        <Text style={styles.label}>Renk Seçin</Text>
                        <View style={styles.grid}>
                            {AVATAR_COLORS.map((color) => (
                                <TouchableOpacity
                                    key={color}
                                    style={[
                                        styles.colorItem,
                                        { backgroundColor: color },
                                        selectedColor === color && styles.selectedColorItem
                                    ]}
                                    onPress={() => setSelectedColor(color)}
                                >
                                    {selectedColor === color && <Ionicons name="checkmark" size={16} color="#FFF" />}
                                </TouchableOpacity>
                            ))}
                        </View>
                    </ScrollView>

                    {/* Butonlar */}
                    <View style={styles.footer}>
                        {initialData && onDelete && (
                            <TouchableOpacity style={styles.deleteButton} onPress={onDelete}>
                                <Ionicons name="trash-outline" size={20} color="#FFF" />
                            </TouchableOpacity>
                        )}

                        <TouchableOpacity
                            style={[styles.saveButton, { flex: initialData ? 1 : 0, width: initialData ? 'auto' : '100%' }]}
                            onPress={handleSave}
                        >
                            <Text style={styles.saveButtonText}>
                                {initialData ? "Güncelle" : "Ekle"}
                            </Text>
                        </TouchableOpacity>
                    </View>

                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    container: {
        backgroundColor: '#FFF',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        padding: 24,
        maxHeight: '85%',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        color: Colors.secondary,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: Colors.gray[600],
        marginBottom: 8,
        marginTop: 12,
    },
    input: {
        backgroundColor: Colors.gray[100],
        padding: 12,
        borderRadius: 12,
        fontSize: 16,
        color: Colors.secondary,
        borderWidth: 1,
        borderColor: Colors.gray[200],
    },
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
    },
    iconItem: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: Colors.gray[100],
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2,
        borderColor: 'transparent',
    },
    colorItem: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },
    selectedColorItem: {
        borderWidth: 3,
        borderColor: Colors.gray[300],
        transform: [{ scale: 1.1 }],
    },
    footer: {
        flexDirection: 'row',
        gap: 12,
        marginTop: 30,
    },
    saveButton: {
        backgroundColor: Colors.primary,
        paddingVertical: 14,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    saveButtonText: {
        color: '#FFF',
        fontWeight: 'bold',
        fontSize: 16,
    },
    deleteButton: {
        backgroundColor: '#EF4444',
        width: 50,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    }
});