import React from 'react';
import {
  Modal,
  StyleSheet,
  View,
  type ModalProps,
  ActivityIndicator,
  type ColorValue,
  TouchableOpacity,
  Platform,
  Text,
} from 'react-native';

export interface BackDropProps extends Omit<ModalProps, 'children | visible'> {
  isLoading: boolean;
  color?: ColorValue;
  onClose?: () => void;
  backButton?: React.ReactNode;
}

export const BackDrop: React.FunctionComponent<BackDropProps> = ({
  color = 'blue',
  isLoading,
  onClose,
  backButton,
  ...otherModalProps
}) => {
  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={isLoading}
      {...otherModalProps}
    >
      <View style={styles.centeredView}>
        <ActivityIndicator color={color} />
      </View>
      {onClose && (
        <TouchableOpacity
          onPress={onClose}
          activeOpacity={0.7}
          accessibilityHint="close-backdrop"
          style={[styles.icon, backButton ? styles.customBackButton : {}]}
        >
          {backButton ?? <Text style={[styles.closeText]}>×</Text>}
        </TouchableOpacity>
      )}
    </Modal>
  );
};

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  closeText: {
    lineHeight: 32,
    fontWeight: 'bold',
    fontSize: 28,
  },
  icon: {
    alignItems: 'center',
    borderColor: '#fff',
    borderRadius: 999,
    shadowOpacity: 0.08,
    height: 50,
    width: 50,
    position: 'absolute',
    right: '0%',
    elevation: 4,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: {
      width: 4,
      height: 0.5,
    },
    justifyContent: 'center',
    marginRight: 16,
    marginTop: Platform.select({
      ios: '15%',
      android: '7%',
    }),
    shadowRadius: 20,
  },
  customBackButton: { backgroundColor: 'transparent' },
});
