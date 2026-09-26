import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { Pressable, ScrollView, Text, View } from "react-native";
import { useState } from "react";

import { ScreenContainer } from "@/components/screen-container";
import { findProduct } from "@/data/catalog";
import { useStore } from "@/lib/store";
import { useColors } from "@/hooks/use-colors";

const formatPrice = (value: number) => `${value.toFixed(2)} ر.س`;

export default function ProductDetailsScreen() {
  const colors = useColors();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const product = findProduct(id);
  const { addToCart } = useStore();
  const [added, setAdded] = useState(false);

  if (!product) {
    return (
      <ScreenContainer className="p-5">
        <Stack.Screen options={{ title: "المنتج" }} />
        <Text style={{ color: colors.foreground, fontSize: 20, fontWeight: "800", textAlign: "right" }}>المنتج غير موجود</Text>
        <Pressable onPress={() => router.back()} style={{ marginTop: 20, backgroundColor: colors.primary, borderRadius: 14, padding: 15 }}>
          <Text style={{ color: "#FFFFFF", textAlign: "center", fontWeight: "800" }}>العودة</Text>
        </Pressable>
      </ScreenContainer>
    );
  }

  const handleAdd = () => {
    addToCart(product);
    setAdded(true);
  };

  return (
    <ScreenContainer className="px-5" edges={["top", "left", "right", "bottom"]}>
      <Stack.Screen options={{ title: product.name, headerShown: false }} />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingTop: 12, paddingBottom: 30 }}>
        <Pressable onPress={() => router.back()} style={({ pressed }) => [{ opacity: pressed ? 0.6 : 1, alignSelf: "flex-end", marginBottom: 18 }]}>
          <Text style={{ color: colors.primary, fontSize: 15, fontWeight: "800" }}>‹ العودة</Text>
        </Pressable>
        <View style={{ height: 280, borderRadius: 32, backgroundColor: product.color, alignItems: "center", justifyContent: "center" }}>
          <Text style={{ fontSize: 110 }}>{product.icon}</Text>
          {product.badge ? <View style={{ position: "absolute", top: 18, right: 18, paddingHorizontal: 11, paddingVertical: 7, borderRadius: 10, backgroundColor: "rgba(255,255,255,0.85)" }}><Text style={{ color: colors.primary, fontSize: 11, fontWeight: "900" }}>{product.badge}</Text></View> : null}
        </View>
        <View style={{ flexDirection: "row-reverse", justifyContent: "space-between", alignItems: "flex-start", marginTop: 24 }}>
          <View style={{ flex: 1 }}>
            <Text style={{ color: colors.muted, fontSize: 12, textAlign: "right" }}>{product.category}</Text>
            <Text style={{ color: colors.foreground, fontSize: 26, fontWeight: "900", textAlign: "right", marginTop: 5 }}>{product.name}</Text>
          </View>
          <Text style={{ color: colors.primary, fontSize: 20, fontWeight: "900", marginTop: 19 }}>{formatPrice(product.price)}</Text>
        </View>
        <Text style={{ color: colors.muted, fontSize: 15, lineHeight: 25, textAlign: "right", marginTop: 13 }}>{product.subtitle}</Text>
        <View style={{ flexDirection: "row-reverse", gap: 9, marginTop: 22 }}>
          <View style={{ flex: 1, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: 16, padding: 14, alignItems: "center" }}>
            <Text style={{ fontSize: 20 }}>✓</Text>
            <Text style={{ color: colors.foreground, fontSize: 11, fontWeight: "700", marginTop: 7 }}>أصلي 100%</Text>
          </View>
          <View style={{ flex: 1, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: 16, padding: 14, alignItems: "center" }}>
            <Text style={{ fontSize: 20 }}>🚚</Text>
            <Text style={{ color: colors.foreground, fontSize: 11, fontWeight: "700", marginTop: 7 }}>توصيل سريع</Text>
          </View>
          <View style={{ flex: 1, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: 16, padding: 14, alignItems: "center" }}>
            <Text style={{ fontSize: 20 }}>↺</Text>
            <Text style={{ color: colors.foreground, fontSize: 11, fontWeight: "700", marginTop: 7 }}>استبدال سهل</Text>
          </View>
        </View>
        <View style={{ backgroundColor: "#EFF8F6", borderRadius: 18, padding: 16, marginTop: 18 }}>
          <Text style={{ color: colors.primary, fontWeight: "900", fontSize: 14, textAlign: "right" }}>ملاحظة صيدلانية</Text>
          <Text style={{ color: colors.foreground, fontSize: 12, lineHeight: 20, textAlign: "right", marginTop: 6 }}>استشر الصيدلي إذا كنت تستخدم أدوية أخرى أو لديك حساسية معروفة. المعلومات المعروضة للتعريف بالمنتج فقط.</Text>
        </View>
        <Pressable
          onPress={handleAdd}
          style={({ pressed }) => [{ backgroundColor: added ? colors.success : colors.primary, borderRadius: 17, paddingVertical: 17, marginTop: 24, transform: [{ scale: pressed ? 0.98 : 1 }] }]}
        >
          <Text style={{ color: "#FFFFFF", textAlign: "center", fontSize: 16, fontWeight: "900" }}>{added ? "تمت الإضافة إلى السلة ✓" : "أضف إلى السلة"}</Text>
        </Pressable>
        {added ? <Pressable onPress={() => router.push("/(tabs)/cart")} style={{ paddingVertical: 14 }}><Text style={{ color: colors.primary, textAlign: "center", fontWeight: "800" }}>الانتقال إلى السلة</Text></Pressable> : null}
      </ScrollView>
    </ScreenContainer>
  );
}
