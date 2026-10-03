import { FlatList, Pressable, Text, View, type ListRenderItem } from "react-native";
import { useRouter } from "expo-router";

import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { useStore, type Order } from "@/lib/store";
import { trpc } from "@/lib/trpc";

const formatPrice = (value: number) => `${value.toFixed(2)} ر.س`;
const formatDate = (value: string) => new Intl.DateTimeFormat("ar-SA", { day: "numeric", month: "short", hour: "numeric", minute: "2-digit" }).format(new Date(value));

export default function OrdersScreen() {
  const colors = useColors();
  const router = useRouter();
  const { orders } = useStore();
  const remoteOrders = trpc.orders.list.useQuery({ scope: "mine" });
  const visibleOrders: Order[] = remoteOrders.data
    ? remoteOrders.data.map((item) => ({
        id: item.id,
        createdAt: new Date(item.createdAt).toISOString(),
        items: [],
        total: Number(item.total) || 0,
        address: item.deliveryAddress,
        status: item.status === "delivered" ? "تم التسليم" : item.status === "in_transit" ? "في الطريق" : "قيد التجهيز",
      }))
    : orders;

  const renderOrder: ListRenderItem<Order> = ({ item }) => (
    <View style={{ backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: 20, padding: 16, marginBottom: 12 }}>
      <View style={{ flexDirection: "row-reverse", justifyContent: "space-between", alignItems: "center" }}>
        <View>
          <Text style={{ color: colors.foreground, fontSize: 15, fontWeight: "900", textAlign: "right" }}>طلب #{item.id}</Text>
          <Text style={{ color: colors.muted, fontSize: 11, textAlign: "right", marginTop: 4 }}>{formatDate(item.createdAt)}</Text>
        </View>
        <View style={{ backgroundColor: "#FFF2DA", borderRadius: 9, paddingHorizontal: 9, paddingVertical: 6 }}><Text style={{ color: colors.warning, fontSize: 10, fontWeight: "900" }}>{item.status}</Text></View>
      </View>
      <View style={{ height: 1, backgroundColor: colors.border, marginVertical: 14 }} />
      <View style={{ flexDirection: "row-reverse", alignItems: "center" }}>
        <View style={{ flexDirection: "row-reverse", flex: 1 }}>
          {item.items.slice(0, 3).map((product, index) => <View key={product.id} style={{ width: 37, height: 37, borderRadius: 12, backgroundColor: product.color, alignItems: "center", justifyContent: "center", marginLeft: index === 0 ? 0 : -8, borderWidth: 2, borderColor: colors.surface }}><Text style={{ fontSize: 18 }}>{product.icon}</Text></View>)}
          {item.items.length > 3 ? <Text style={{ color: colors.muted, fontSize: 11, alignSelf: "center", marginRight: 7 }}>+{item.items.length - 3}</Text> : null}
        </View>
        <View><Text style={{ color: colors.muted, fontSize: 11, textAlign: "right" }}>{item.items.reduce((sum, product) => sum + product.quantity, 0)} قطع</Text><Text style={{ color: colors.primary, fontSize: 15, fontWeight: "900", textAlign: "right", marginTop: 4 }}>{formatPrice(item.total)}</Text></View>
      </View>
      <View style={{ flexDirection: "row-reverse", alignItems: "center", marginTop: 14, backgroundColor: colors.background, borderRadius: 10, padding: 9 }}><Text style={{ color: colors.muted, fontSize: 11, flex: 1, textAlign: "right" }} numberOfLines={1}>{item.address}</Text><Text style={{ fontSize: 15, marginLeft: 6 }}>⌖</Text></View>
    </View>
  );

  return (
    <ScreenContainer className="px-5">
      <FlatList
        data={visibleOrders}
        renderItem={renderOrder}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingTop: 18, paddingBottom: 30, flexGrow: 1 }}
        ListHeaderComponent={<View style={{ marginBottom: 20 }}><Text style={{ color: colors.foreground, fontSize: 28, fontWeight: "900", textAlign: "right" }}>طلباتي</Text><Text style={{ color: colors.muted, fontSize: 13, textAlign: "right", marginTop: 5 }}>{remoteOrders.isLoading ? "جارٍ تحديث الطلبات..." : "تابع حالة طلباتك لحظة بلحظة"}</Text></View>}
        ListEmptyComponent={<View style={{ flex: 1, alignItems: "center", justifyContent: "center", paddingBottom: 100 }}><View style={{ width: 86, height: 86, borderRadius: 30, backgroundColor: "#E5F4F2", alignItems: "center", justifyContent: "center" }}><Text style={{ fontSize: 39 }}>📦</Text></View><Text style={{ color: colors.foreground, fontSize: 19, fontWeight: "900", marginTop: 18 }}>لا توجد طلبات بعد</Text><Text style={{ color: colors.muted, fontSize: 13, marginTop: 6 }}>ابدأ أول طلب لك من متجر صيدلي</Text><Pressable onPress={() => router.replace("/(tabs)")} style={({ pressed }) => [{ backgroundColor: colors.primary, paddingHorizontal: 24, paddingVertical: 14, borderRadius: 15, marginTop: 24, opacity: pressed ? 0.8 : 1 }]}><Text style={{ color: "#FFFFFF", fontWeight: "900" }}>تصفح المتجر</Text></Pressable></View>}
      />
    </ScreenContainer>
  );
}
