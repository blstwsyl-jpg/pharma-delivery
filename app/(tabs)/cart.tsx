import { useState } from "react";
import {
  Alert,
  FlatList,
  Pressable,
  Text,
  TextInput,
  View,
  type ListRenderItem,
} from "react-native";
import { useRouter } from "expo-router";

import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { useStore, type CartItem } from "@/lib/store";
import { getDeliveryFee, getOrderTotal } from "@/lib/store-utils";

const formatPrice = (value: number) => `${value.toFixed(2)} ر.س`;

export default function CartScreen() {
  const colors = useColors();
  const router = useRouter();
  const { cart, cartTotal, updateQuantity, removeFromCart, placeOrder, isPlacingOrder } = useStore();
  const [address, setAddress] = useState("شارع الزهراء، حي النخيل");
  const [addressError, setAddressError] = useState("");
  const delivery = getDeliveryFee(cartTotal);
  const grandTotal = getOrderTotal(cartTotal);

  const handleCheckout = async () => {
    if (!address.trim()) {
      setAddressError("أدخل عنوان التوصيل للمتابعة");
      return;
    }
    try {
      await placeOrder(address.trim());
      Alert.alert("تم استلام طلبك", "سنرسل لك تحديثاً عند بدء تجهيز الطلب.", [
        { text: "متابعة الطلب", onPress: () => router.replace("/(tabs)/orders") },
      ]);
    } catch {
      Alert.alert("تعذر إنشاء الطلب", "سجّل الدخول أولاً وتأكد من اتصال الإنترنت ثم حاول مجدداً.");
    }
  };

  const renderItem: ListRenderItem<CartItem> = ({ item }) => (
    <View style={{ flexDirection: "row-reverse", alignItems: "center", paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: colors.border }}>
      <View style={{ width: 70, height: 70, borderRadius: 18, backgroundColor: item.color, alignItems: "center", justifyContent: "center" }}>
        <Text style={{ fontSize: 30 }}>{item.icon}</Text>
      </View>
      <View style={{ flex: 1, marginHorizontal: 12 }}>
        <Text style={{ color: colors.foreground, fontWeight: "800", fontSize: 14, textAlign: "right" }}>{item.name}</Text>
        <Text style={{ color: colors.primary, fontWeight: "800", fontSize: 13, textAlign: "right", marginTop: 5 }}>{formatPrice(item.price)}</Text>
        <Pressable onPress={() => removeFromCart(item.id)} style={({ pressed }) => [{ opacity: pressed ? 0.6 : 1, alignSelf: "flex-end", marginTop: 5 }]}>
          <Text style={{ color: colors.error, fontSize: 11, fontWeight: "700" }}>حذف</Text>
        </Pressable>
      </View>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
        <Pressable onPress={() => updateQuantity(item.id, item.quantity + 1)} style={({ pressed }) => [{ width: 28, height: 28, borderRadius: 10, backgroundColor: colors.primary, alignItems: "center", justifyContent: "center", opacity: pressed ? 0.7 : 1 }]}><Text style={{ color: "#FFFFFF", fontSize: 18 }}>+</Text></Pressable>
        <Text style={{ color: colors.foreground, minWidth: 18, textAlign: "center", fontWeight: "800" }}>{item.quantity}</Text>
        <Pressable onPress={() => updateQuantity(item.id, item.quantity - 1)} style={({ pressed }) => [{ width: 28, height: 28, borderRadius: 10, backgroundColor: colors.background, borderWidth: 1, borderColor: colors.border, alignItems: "center", justifyContent: "center", opacity: pressed ? 0.7 : 1 }]}><Text style={{ color: colors.foreground, fontSize: 18 }}>−</Text></Pressable>
      </View>
    </View>
  );

  return (
    <ScreenContainer className="px-5" edges={["top", "left", "right"]}>
      <FlatList
        data={cart}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingTop: 18, paddingBottom: 25, flexGrow: 1 }}
        ListHeaderComponent={
          <View style={{ marginBottom: 8 }}>
            <Text style={{ color: colors.foreground, fontSize: 28, fontWeight: "900", textAlign: "right" }}>سلة مشترياتك</Text>
            <Text style={{ color: colors.muted, fontSize: 13, textAlign: "right", marginTop: 5 }}>{cart.length ? `${cart.length} منتجات بانتظارك` : "راجع منتجاتك قبل إتمام الطلب"}</Text>
          </View>
        }
        ListEmptyComponent={
          <View style={{ flex: 1, alignItems: "center", justifyContent: "center", paddingVertical: 80 }}>
            <View style={{ width: 86, height: 86, borderRadius: 30, backgroundColor: "#E5F4F2", alignItems: "center", justifyContent: "center" }}><Text style={{ fontSize: 40 }}>🛒</Text></View>
            <Text style={{ color: colors.foreground, fontSize: 19, fontWeight: "900", marginTop: 18 }}>السلة فارغة</Text>
            <Text style={{ color: colors.muted, fontSize: 13, marginTop: 6 }}>أضف ما تحتاجه وسنوصله لبابك</Text>
            <Pressable onPress={() => router.replace("/(tabs)")} style={({ pressed }) => [{ backgroundColor: colors.primary, paddingHorizontal: 24, paddingVertical: 14, borderRadius: 15, marginTop: 24, opacity: pressed ? 0.8 : 1 }]}><Text style={{ color: "#FFFFFF", fontWeight: "900" }}>تصفح المنتجات</Text></Pressable>
          </View>
        }
        ListFooterComponent={cart.length ? (
          <View>
            <View style={{ marginTop: 22, backgroundColor: colors.surface, borderRadius: 20, borderWidth: 1, borderColor: colors.border, padding: 16 }}>
              <View style={{ flexDirection: "row-reverse", justifyContent: "space-between", alignItems: "center" }}><Text style={{ color: colors.foreground, fontSize: 15, fontWeight: "900" }}>عنوان التوصيل</Text><Text style={{ fontSize: 18 }}>⌖</Text></View>
              <TextInput value={address} onChangeText={(value) => { setAddress(value); setAddressError(""); }} placeholder="اكتب العنوان بالتفصيل" placeholderTextColor={colors.muted} style={{ color: colors.foreground, textAlign: "right", borderWidth: 1, borderColor: addressError ? colors.error : colors.border, borderRadius: 12, paddingHorizontal: 12, paddingVertical: 11, marginTop: 12, fontSize: 13 }} />
              {addressError ? <Text style={{ color: colors.error, fontSize: 11, textAlign: "right", marginTop: 6 }}>{addressError}</Text> : null}
            </View>
            <View style={{ marginTop: 18, gap: 11 }}>
              <View style={{ flexDirection: "row-reverse", justifyContent: "space-between" }}><Text style={{ color: colors.muted, fontSize: 13 }}>المجموع الفرعي</Text><Text style={{ color: colors.foreground, fontSize: 13, fontWeight: "700" }}>{formatPrice(cartTotal)}</Text></View>
              <View style={{ flexDirection: "row-reverse", justifyContent: "space-between" }}><Text style={{ color: colors.muted, fontSize: 13 }}>رسوم التوصيل</Text><Text style={{ color: delivery ? colors.foreground : colors.success, fontSize: 13, fontWeight: "700" }}>{delivery ? formatPrice(delivery) : "مجاني"}</Text></View>
              <View style={{ height: 1, backgroundColor: colors.border, marginVertical: 3 }} />
              <View style={{ flexDirection: "row-reverse", justifyContent: "space-between" }}><Text style={{ color: colors.foreground, fontSize: 17, fontWeight: "900" }}>الإجمالي</Text><Text style={{ color: colors.primary, fontSize: 18, fontWeight: "900" }}>{formatPrice(grandTotal)}</Text></View>
            </View>
            <Pressable disabled={isPlacingOrder} onPress={handleCheckout} style={({ pressed }) => [{ backgroundColor: colors.primary, borderRadius: 17, paddingVertical: 17, marginTop: 22, opacity: isPlacingOrder ? 0.55 : pressed ? 0.86 : 1, transform: [{ scale: pressed ? 0.98 : 1 }] }]}><Text style={{ color: "#FFFFFF", textAlign: "center", fontSize: 16, fontWeight: "900" }}>{isPlacingOrder ? "جارٍ إرسال الطلب..." : `تأكيد الطلب · ${formatPrice(grandTotal)}`}</Text></Pressable>
            <Text style={{ color: colors.muted, fontSize: 11, textAlign: "center", marginTop: 11 }}>الدفع عند الاستلام متاح حالياً</Text>
          </View>
        ) : null}
      />
    </ScreenContainer>
  );
}
