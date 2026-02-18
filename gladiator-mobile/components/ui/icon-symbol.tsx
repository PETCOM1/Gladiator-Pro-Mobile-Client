// Fallback for using MaterialIcons on Android and web.

import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { SymbolViewProps, SymbolWeight } from 'expo-symbols';
import { ComponentProps } from 'react';
import { OpaqueColorValue, type StyleProp, type TextStyle } from 'react-native';

type IconMapping = Partial<Record<SymbolViewProps['name'], ComponentProps<typeof MaterialIcons>['name']>>;
type IconSymbolName = keyof typeof MAPPING;

/**
 * Add your SF Symbols to Material Icons mappings here.
 * - see Material Icons in the [Icons Directory](https://icons.expo.fyi).
 * - see SF Symbols in the [SF Symbols](https://developer.apple.com/sf-symbols/) app.
 */
const MAPPING = {
  // Existing & Core
  'house.fill': 'home',
  'paperplane.fill': 'send',
  'chevron.left.forwardslash.chevron.right': 'code',
  'chevron.right': 'chevron-right',
  'pencil.and.outline': 'edit',
  'map.fill': 'map',
  'person.2.fill': 'people',
  'chart.bar.fill': 'bar-chart',
  'antenna.radiowaves.left.and.right': 'settings-input-antenna',
  'shield.fill': 'shield',
  'bolt.fill': 'bolt',
  'building.2.fill': 'business',
  'person.fill': 'person',
  'lock.fill': 'lock',
  'person.crop.circle.fill': 'account-circle',

  // OB Entry / Incidents
  'shield.slash.fill': 'remove-moderator',
  'shield.checkered': 'verified-user',
  'flame.fill': 'whatshot',
  'cross.case.fill': 'medical-services',
  'hammer.fill': 'handyman',
  'eye.fill': 'visibility',
  'lock.open.fill': 'lock-open',
  'questionmark.circle.fill': 'help',
  'info.circle.fill': 'info',
  'exclamationmark.triangle.fill': 'warning',
  'exclamationmark.circle.fill': 'error',
  'checkmark.shield.fill': 'verified-user',
  'camera.fill': 'photo-camera',
  'xmark.circle.fill': 'cancel',
  'minus.circle.fill': 'remove-circle',
  'equal.circle.fill': 'drag-handle',
  'xmark.octagon.fill': 'dangerous',
  'bag.fill': 'shopping-bag',
  'doc.text.fill': 'description',
  'creditcard.fill': 'credit-card',

  // Visitors
  'briefcase.fill': 'business-center',
  'shippingbox.fill': 'inventory',
  'wrench.and.screwdriver.fill': 'handyman',
  'ellipsis.circle.fill': 'more-horiz',
  'person.text.rectangle.fill': 'assignment-ind',
  'phone.fill': 'phone',
  'car.fill': 'directions-car',
  'barcode.viewfinder': 'qr-code-scanner',

  // Patrol & Scanner
  'checkmark.circle.fill': 'check-circle',
  'sensor.tag.radiowaves.forward.fill': 'nfc',
  'qrcode.viewfinder': 'qr-code-scanner',

  // Profile & Navigation
  'chevron.up.chevron.down': 'unfold-more',
  'checkmark': 'check',
  'sun.max.fill': 'light-mode',
  'moon.fill': 'dark-mode',
  'gear': 'settings',
  'lock.shield.fill': 'security',
} as IconMapping;


/**
 * An icon component that uses native SF Symbols on iOS, and Material Icons on Android and web.
 * This ensures a consistent look across platforms, and optimal resource usage.
 * Icon `name`s are based on SF Symbols and require manual mapping to Material Icons.
 */
export function IconSymbol({
  name,
  size = 24,
  color,
  style,
}: {
  name: IconSymbolName;
  size?: number;
  color: string | OpaqueColorValue;
  style?: StyleProp<TextStyle>;
  weight?: SymbolWeight;
}) {
  return <MaterialIcons color={color} size={size} name={MAPPING[name]} style={style} />;
}
