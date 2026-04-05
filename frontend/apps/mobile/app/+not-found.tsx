import { View } from 'react-native';
import { Text } from '@/components/ui/text';
import Stack from 'expo-router/stack';
import Link from 'expo-router/link';

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: 'Oops!' }} />
      <View>
        <Text>This screen doesn't exist.</Text>

        <Link href="/">
          <Text>Go to home screen!</Text>
        </Link>
      </View>
    </>
  );
}
