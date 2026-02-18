import { Radius } from '@/constants/theme';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useThemeColor } from '@/hooks/use-theme-color';
import React, { useState } from 'react';
import { FlatList, Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export type PickerOption = {
    label: string;
    value: string;
    icon?: string;
    color?: string;
};

export type ThemedPickerProps = {
    label?: string;
    options: PickerOption[];
    selectedValue?: string;
    onValueChange: (value: string) => void;
    placeholder?: string;
};

export function ThemedPicker({ label, options, selectedValue, onValueChange, placeholder = 'Select...' }: ThemedPickerProps) {
    const [modalVisible, setModalVisible] = useState(false);
    const textColor = useThemeColor({}, 'text');
    const background = useThemeColor({}, 'background');
    const cardColor = useThemeColor({}, 'card');
    const tintColor = useThemeColor({}, 'tint');
    const cardBorder = useThemeColor({}, 'cardBorder');
    const dimText = useThemeColor({}, 'dimText');

    const selectedOption = options.find(opt => opt.value === selectedValue);

    return (
        <View style={styles.container}>
            {label && <Text style={[styles.label, { color: dimText }]}>{label}</Text>}

            <TouchableOpacity
                style={[styles.picker, { backgroundColor: cardColor, borderColor: cardBorder }]}
                onPress={() => setModalVisible(true)}
                activeOpacity={0.7}
            >
                {selectedOption?.icon && (
                    <IconSymbol name={selectedOption.icon as any} size={18} color={selectedOption.color || dimText} style={styles.selectedIcon} />
                )}
                <Text style={[styles.pickerText, { color: selectedOption ? textColor : dimText }]} numberOfLines={1}>
                    {selectedOption?.label || placeholder}
                </Text>
                <IconSymbol name="chevron.up.chevron.down" size={14} color={dimText} />
            </TouchableOpacity>

            <Modal visible={modalVisible} animationType="slide" transparent>
                <View style={styles.modalOverlay}>
                    <SafeAreaView style={[styles.modalSheet, { backgroundColor: background }]} edges={['bottom']}>
                        <View style={[styles.modalHandle, { backgroundColor: cardBorder }]} />
                        <View style={[styles.modalHeader, { borderBottomColor: cardBorder }]}>
                            <Text style={[styles.modalTitle, { color: textColor }]}>{label || 'Select'}</Text>
                            <TouchableOpacity onPress={() => setModalVisible(false)}>
                                <Text style={[styles.doneBtn, { color: tintColor }]}>Done</Text>
                            </TouchableOpacity>
                        </View>

                        <FlatList
                            data={options}
                            keyExtractor={item => item.value}
                            renderItem={({ item }) => {
                                const isActive = item.value === selectedValue;
                                return (
                                    <TouchableOpacity
                                        style={[styles.optionRow, isActive && { backgroundColor: `${tintColor}08` }]}
                                        onPress={() => { onValueChange(item.value); setModalVisible(false); }}
                                        activeOpacity={0.6}
                                    >
                                        {item.icon && (
                                            <View style={[styles.optionIcon, { backgroundColor: `${item.color || tintColor}10` }]}>
                                                <IconSymbol name={item.icon as any} size={18} color={item.color || dimText} />
                                            </View>
                                        )}
                                        <Text style={[styles.optionLabel, { color: textColor, fontWeight: isActive ? '600' : '400' }]}>
                                            {item.label}
                                        </Text>
                                        {isActive && <IconSymbol name="checkmark" size={18} color={tintColor} />}
                                    </TouchableOpacity>
                                );
                            }}
                            ItemSeparatorComponent={() => <View style={[styles.sep, { backgroundColor: cardBorder }]} />}
                            contentContainerStyle={styles.list}
                        />
                    </SafeAreaView>
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { marginVertical: 6, width: '100%' },
    label: { fontSize: 13, marginBottom: 6, fontWeight: '500' },
    picker: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        paddingVertical: 13, paddingHorizontal: 14, borderWidth: 1, borderRadius: Radius.sm, minHeight: 48,
    },
    selectedIcon: { marginRight: 10 },
    pickerText: { flex: 1, fontSize: 15 },
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.3)', justifyContent: 'flex-end' },
    modalSheet: { borderTopLeftRadius: Radius.lg, borderTopRightRadius: Radius.lg, maxHeight: '65%' },
    modalHandle: { width: 36, height: 4, borderRadius: 2, alignSelf: 'center', marginTop: 10, marginBottom: 6 },
    modalHeader: {
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
        paddingHorizontal: 20, paddingVertical: 14, borderBottomWidth: 1,
    },
    modalTitle: { fontSize: 17, fontWeight: '600' },
    doneBtn: { fontSize: 15, fontWeight: '600' },
    list: { paddingBottom: 20 },
    optionRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, paddingHorizontal: 20 },
    optionIcon: { width: 36, height: 36, borderRadius: Radius.sm, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
    optionLabel: { flex: 1, fontSize: 15 },
    sep: { height: StyleSheet.hairlineWidth, marginHorizontal: 20 },
});
