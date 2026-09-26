import { useMemo, useState } from "react";
import {
  FlatList,
  Pressable,
  Text,
  TextInput,
  View,
  type ListRenderItem,
} from "react-native";
import { useRouter } from "expo-router";

import { ScreenContainer } from "@/components/screen-container";
import { categories, products, type Product } from "@/data/catalog";
import { useStore } from "@/lib/store";
import { useColors } from "@/hooks/use-colors";

const formatPrice = (value: number) => `${value.toFixed(2)} ر.س`;

export default function HomeScreen() {
  const colors = useColors();
  const router = useRouter();
  const { addToCart, cartCount } = useStore();
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const [notice, setNotice] = useState("");

  const filteredProducts = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return products.filter((product) => {
      const matchesCategory = activeCategory === "all" || product.category === activeCategory;
      const matchesSearch =
        !normalized ||
        product.name.toLowerCase().includes(normalized) ||
        product.subtitle.toLowerCase().includes(normalized);
      return matchesCategory && matchesSearch;
    });
  }, [activeCategory, query]);

  const handleAdd = (product: Product) => {
    addToCart(product);
    setNotice(`أضيف ${product.name} إلى السلة`);
    setTimeout(() => setNotice(""), 2200);
  };

  const renderProduct: ListRenderItem<Product> = ({ item }) => (
    <View
      style={{
        width: "48%",
        marginBottom: 14,
        borderRadius: 22,
        padding: 12,
        backgroundColor: colors.surface,
        borderWidth: 1,
        borderColor: colors.border,
        shadowColor: "#123735",
        shadowOpacity: 0.05,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 5 },
        elevation: 2,
      }}
    >
      <Pressable
        onPress={() => router.push({ pathname: "/product/[id]", params: { id: item.id } })}
        style={({ pressed }) => [{ opacity: pressed ? 0.78 : 1 }]}
      >
        <View
          style={{
            height: 112,
            borderRadius: 18,
            backgroundColor: item.color,
            alignItems: "center",
            justifyContent: "center",
            marginBottom: 12,
          }}
        >
          <Text style={{ fontSize: 45 }}>{item.icon}</Text>
          {item.badge ? (
            <View
              style={{
                position: "absolute",
                top: 8,
                right: 8,
                paddingHorizontal: 7,
                paddingVertical: 4,
                borderRadius: 7,
                backgroundColor: "rgba(255,255,255,0.84)",
              }}
            >
              <Text style={{ color: colors.primary, fontSize: 9, fontWeight: "800" }}>
                {item.badge}
              </Text>
            </View>
          ) : null}
        </View>
        <Text
          style={{ color: colors.foreground, fontSize: 14, fontWeight: "800", textAlign: "right" }}
          numberOfLines={1}
        >
          {item.name}
        </Text>
        <Text
          style={{ color: colors.muted, fontSize: 11, lineHeight: 16, textAlign: "right", marginTop: 4 }}
          numberOfLines={2}
        >
          {item.subtitle}
        </Text>
      </Pressable>
      <View style={{ flexDirection: "row-reverse", alignItems: "center", justifyContent: "space-between", marginTop: 12 }}>
        <Text style={{ color: colors.primary, fontSize: 14, fontWeight: "900" }}>
          {formatPrice(item.price)}
        </Text>
        <Pressable
          onPress={() => handleAdd(item)}
          style={({ pressed }) => [
            {
              backgroundColor: colors.primary,
              height: 32,
              minWidth: 32,
              borderRadius: 11,
              alignItems: "center",
              justifyContent: "center",
              transform: [{ scale: pressed ? 0.94 : 1 }],
            },
          ]}
          accessibilityLabel={`أضف ${item.name} للسلة`}
        >
          <Text style={{ color: "#FFFFFF", fontSize: 21, lineHeight: 23, fontWeight: "400" }}>+</Text>
        </Pressable>
      </View>
    </View>
  );

  return (
    <ScreenContainer className="px-5" safeAreaClassName="bg-background">
      <FlatList
        data={filteredProducts}
        renderItem={renderProduct}
        keyExtractor={(item) => item.id}
        numColumns={2}
        columnWrapperStyle={{ justifyContent: "space-between" }}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingTop: 16, paddingBottom: 30 }}
        ListHeaderComponent={
          <View>
            <View style={{ flexDirection: "row-reverse", alignItems: "center", justifyContent: "space-between", marginBottom: 22 }}>
              <View>
                <Text style={{ color: colors.muted, fontSize: 13, textAlign: "right" }}>أهلاً بك في</Text>
                <Text style={{ color: colors.foreground, fontSize: 28, fontWeight: "900", marginTop: 3, textAlign: "right" }}>
                  صيدلي <Text style={{ color: colors.primary }}>✦</Text>
                </Text>
              </View>
              <Pressable
                onPress={() => router.push("/(tabs)/cart")}
                style={({ pressed }) => [{ opacity: pressed ? 0.7 : 1 }]}
                accessibilityLabel="فتح السلة"
              >
                <View style={{ width: 45, height: 45, borderRadius: 16, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, alignItems: "center", justifyContent: "center" }}>
                  <Text style={{ fontSize: 22 }}>🛒</Text>
                  {cartCount > 0 ? (
                    <View style={{ position: "absolute", top: -5, right: -5, minWidth: 20, height: 20, paddingHorizontal: 5, borderRadius: 10, backgroundColor: colors.primary, alignItems: "center", justifyContent: "center" }}>
                      <Text style={{ color: "#FFFFFF", fontSize: 10, fontWeight: "900" }}>{cartCount}</Text>
                    </View>
                  ) : null}
                </View>
              </Pressable>
            </View>

            <View style={{ backgroundColor: colors.primary, borderRadius: 25, padding: 20, minHeight: 154, overflow: "hidden", marginBottom: 18 }}>
              <View style={{ position: "absolute", width: 160, height: 160, borderRadius: 80, backgroundColor: "rgba(255,255,255,0.08)", right: -42, top: -28 }} />
              <View style={{ position: "absolute", width: 90, height: 90, borderRadius: 45, backgroundColor: "rgba(255,255,255,0.07)", left: -20, bottom: -28 }} />
              <Text style={{ color: "#BCE9E2", fontSize: 12, fontWeight: "700", textAlign: "right" }}>رعاية تصل لبابك</Text>
              <Text style={{ color: "#FFFFFF", fontSize: 22, fontWeight: "900", textAlign: "right", marginTop: 8, lineHeight: 29 }}>
                صحتك أولويتنا،{`\n`}والتوصيل علينا
              </Text>
              <View style={{ flexDirection: "row-reverse", alignItems: "center", marginTop: 14 }}>
                <Text style={{ color: "#FFFFFF", fontSize: 12, fontWeight: "700" }}>توصيل مجاني للطلبات فوق 100 ر.س</Text>
                <Text style={{ color: "#FFD27F", fontSize: 18, marginRight: 7 }}>✦</Text>
              </View>
            </View>

            <View style={{ flexDirection: "row-reverse", alignItems: "center", backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: 16, paddingHorizontal: 14, height: 50, marginBottom: 22 }}>
              <Text style={{ fontSize: 19, marginLeft: 9 }}>⌕</Text>
              <TextInput
                value={query}
                onChangeText={setQuery}
                placeholder="ابحث عن دواء أو منتج..."
                placeholderTextColor={colors.muted}
                style={{ flex: 1, color: colors.foreground, fontSize: 14, textAlign: "right" }}
                returnKeyType="search"
              />
            </View>

            <View style={{ flexDirection: "row-reverse", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
              <Text style={{ color: colors.foreground, fontSize: 18, fontWeight: "900" }}>تسوق حسب الفئة</Text>
              <Text style={{ color: colors.primary, fontSize: 12, fontWeight: "700" }}>عرض الكل</Text>
            </View>
            <FlatList
              data={categories}
              horizontal
              inverted
              showsHorizontalScrollIndicator={false}
              keyExtractor={(item) => item.id}
              contentContainerStyle={{ paddingBottom: 22, gap: 10 }}
              renderItem={({ item }) => {
                const active = activeCategory === item.id;
                return (
                  <Pressable
                    onPress={() => setActiveCategory(item.id)}
                    style={({ pressed }) => [{ opacity: pressed ? 0.76 : 1 }]}
                  >
                    <View style={{ minWidth: 78, alignItems: "center", paddingVertical: 10, paddingHorizontal: 8, borderRadius: 17, backgroundColor: active ? colors.primary : colors.surface, borderWidth: 1, borderColor: active ? colors.primary : colors.border }}>
                      <Text style={{ fontSize: 22 }}>{item.icon}</Text>
                      <Text style={{ color: active ? "#FFFFFF" : colors.foreground, fontSize: 11, fontWeight: "700", marginTop: 5 }}>{item.label}</Text>
                    </View>
                  </Pressable>
                );
              }}
            />

            <View style={{ flexDirection: "row-reverse", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
              <View>
                <Text style={{ color: colors.foreground, fontSize: 18, fontWeight: "900", textAlign: "right" }}>منتجات مختارة لك</Text>
                <Text style={{ color: colors.muted, fontSize: 12, marginTop: 3, textAlign: "right" }}>{filteredProducts.length} منتجات متاحة الآن</Text>
              </View>
              <Text style={{ color: colors.primary, fontSize: 24 }}>⌁</Text>
            </View>
            {notice ? (
              <View style={{ backgroundColor: "#E2F5EC", borderRadius: 12, padding: 11, marginBottom: 14 }}>
                <Text style={{ color: colors.success, fontSize: 12, fontWeight: "800", textAlign: "center" }}>{notice}</Text>
              </View>
            ) : null}
          </View>
        }
        ListEmptyComponent={
          <View style={{ alignItems: "center", paddingVertical: 60 }}>
            <Text style={{ fontSize: 40 }}>🔎</Text>
            <Text style={{ color: colors.foreground, fontSize: 17, fontWeight: "800", marginTop: 12 }}>لم نجد ما تبحث عنه</Text>
            <Text style={{ color: colors.muted, fontSize: 13, marginTop: 5 }}>جرب كلمة بحث مختلفة أو فئة أخرى</Text>
          </View>
        }
      />
    </ScreenContainer>
  );
}
