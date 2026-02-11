import { IconSymbol } from '@/components/ui/icon-symbol';
import { useThemeColor } from '@/hooks/use-theme-color';
import React, { useState } from 'react';
import {
    FlatList,
    Modal,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
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

export function ThemedPicker({
    label,
    options,
    selectedValue,
    onValueChange,
    placeholder = 'Select an option...'
}: ThemedPickerProps) {
    const [modalVisible, setModalVisible] = useState(false);
    const textColor = useThemeColor({}, 'text');
    const backgroundColor = useThemeColor({}, 'background');
    const cardColor = useThemeColor({}, 'card');
    const tintColor = useThemeColor({}, 'tint');

    const selectedOption = options.find(opt => opt.value === selectedValue);

    const handleSelect = (option: PickerOption) => {
        onValueChange(option.value);
        setModalVisible(false);
    };

    return (
        <View style={styles.container}>
            {label && <Text style={[styles.label, { color: textColor }]}>{label}</Text>}

            <TouchableOpacity
                style={[styles.pickerButton, { backgroundColor: cardColor }]}
                onPress={() => setModalVisible(true)}
            >
                <Text style={[styles.pickerValue, { color: selectedOption ? textColor : '#9BA1A6' }]}>
                    {selectedOption ? selectedOption.label : placeholder}
                </Text>
                <IconSymbol name="chevron.up.chevron.down" size={18} color="#9BA1A6" />
            </TouchableOpacity>

            <Modal
                visible={modalVisible}
                animationType="slide"
                transparent={true}
            >
                <View style={styles.modalOverlay}>
                    <SafeAreaView style={[styles.modalContent, { backgroundColor }]} edges={['bottom']}>
                        <View style={styles.modalHeader}>
                            <Text style={[styles.modalTitle, { color: textColor }]}>{label || 'Select'}</Text>
                            <TouchableOpacity onPress={() => setModalVisible(false)}>
                                <Text style={{ color: tintColor, fontWeight: 'bold' }}>Done</Text>
                            </TouchableOpacity>
                        </View>

                        <FlatList
                            data={options}
                            keyExtractor={(item) => item.value}
                            renderItem={({ item }) => (
                                <TouchableOpacity
                                    style={[
                                        styles.optionItem,
                                        item.value === selectedValue && { backgroundColor: 'rgba(59, 130, 246, 0.1)' }
                                    ]}
                                    onPress={() => handleSelect(item)}
                                >
                                    <View style={styles.optionInfo}>
                                        {item.icon && (
                                            <IconSymbol
                                                name={item.icon as any}
                                                size={20}
                                                color={item.color || textColor}
                                                style={styles.optionIcon}
                                            />
                                        )}
                                        <Text style={[
                                            styles.optionLabel,
                                            { color: item.value === selectedValue ? tintColor : textColor }
                                        ]}>
                                            {item.label}
                                        </Text>
                                    </View>
                                    {item.value === selectedValue && (
                                        <IconSymbol name="checkmark" size={20} color={tintColor} />
                                    )}
                                </TouchableOpacity>
                            )}
                            ItemSeparatorComponent={() => <View style={styles.separator} />}
                            contentContainerStyle={styles.listContent}
                        />
                    </SafeAreaView>
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginVertical: 8,
        width: '100%',
    },
    label: {
        fontSize: 14,
        marginBottom: 4,
        fontWeight: '500',
    },
    pickerButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 12,
        borderRadius: 8,
        height: 48,
    },
    pickerValue: {
        fontSize: 16,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        maxHeight: '70%',
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 20,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: 'rgba(155, 161, 166, 0.2)',
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    listContent: {
        paddingBottom: 20,
    },
    optionItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
    },
    optionInfo: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    optionIcon: {
        marginRight: 12,
    },
    optionLabel: {
        fontSize: 16,
    },
    separator: {
        height: StyleSheet.hairlineWidth,
        backgroundColor: 'rgba(155, 161, 166, 0.1)',
    },
});
