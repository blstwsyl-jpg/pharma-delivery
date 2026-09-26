import { Alert, Pressable, ScrollView, Text, View } from "react-native";

import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { useAuth } from "@/hooks/use-auth";
import { OAUTH_PORTAL_URL, startOAuthLogin } from "@/constants/oauth";

const menuItems = [
  { icon: "⌖", title: "عناوين التوصيل", subtitle: "أضف عنواناً لتوصيل أسرع" },
  { icon: "♡", title: "المفضلة", subtitle: "منتجاتك المحفوظة" },
  { icon: "?", title: "المساعدة والدعم", subtitle: "نحن هنا لخدمتك" },
];

export default function ProfileScreen() {
  const colors = useColors();
  const { user, isAuthenticated, logout } = useAuth({ autoFetch: true });

  const handleMenu = (title: string) => {
    if (title === "المساعدة والدعم") {
      Alert.alert("مركز المساعدة", "تواصل مع فريق صيدلي عبر support@pharma-delivery.app");
      return;
    }
    Alert.alert(title, "هذه المساحة جاهزة للربط بحسابك في الإصدار القادم.");
  };

  const handleAuth = async () => {
    if (isAuthenticated) {
      await logout();
      Alert.alert("تم تسجيل الخروج", "يمكنك تسجيل الدخول مجدداً في أي وقت.");
      return;
    }
    if (!OAUTH_PORTAL_URL) {
      Alert.alert("تسجيل الدخول", "أضف إعدادات بوابة المصادقة في ملف البيئة لتفعيل الدخول في نسخة الإنتاج.");
      return;
    }
    await startOAuthLogin();
  };

  return (
    <ScreenContainer className="px-5">
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingTop: 18, paddingBottom: 32 }}>
        <Text style={{ color: colors.foreground, fontSize: 28, fontWeight: "900", textAlign: "right" }}>حسابي</Text>
        <Text style={{ color: colors.muted, fontSize: 13, textAlign: "right", marginTop: 5 }}>كل ما تحتاجه في مكان واحد</Text>
        <View style={{ backgroundColor: colors.primary, borderRadius: 24, padding: 20, marginTop: 22, flexDirection: "row-reverse", alignItems: "center", overflow: "hidden" }}>
          <View style={{ width: 58, height: 58, borderRadius: 20, backgroundColor: "rgba(255,255,255,0.2)", alignItems: "center", justifyContent: "center" }}><Text style={{ fontSize: 29 }}>{isAuthenticated ? "◉" : "♡"}</Text></View>
          <View style={{ flex: 1, marginRight: 14 }}>
            <Text style={{ color: "#C7EEE8", fontSize: 11, textAlign: "right" }}>{isAuthenticated ? "مرحباً بعودتك" : "تجربة ضيف"}</Text>
            <Text style={{ color: "#FFFFFF", fontSize: 18, fontWeight: "900", textAlign: "right", marginTop: 5 }}>{user?.name || "أنشئ حسابك الآن"}</Text>
            <Text style={{ color: "#D5F4F0", fontSize: 11, textAlign: "right", marginTop: 4 }}>{user?.email || "احفظ عناوينك وتابع طلباتك"}</Text>
          </View>
        </View>
        <Pressable onPress={handleAuth} style={({ pressed }) => [{ borderWidth: 1, borderColor: colors.primary, borderRadius: 15, paddingVertical: 14, marginTop: 14, opacity: pressed ? 0.76 : 1 }]}>
          <Text style={{ color: colors.primary, fontWeight: "900", textAlign: "center" }}>{isAuthenticated ? "تسجيل الخروج" : "تسجيل الدخول أو إنشاء حساب"}</Text>
        </Pressable>
        <Text style={{ color: colors.foreground, fontSize: 17, fontWeight: "900", textAlign: "right", marginTop: 30, marginBottom: 12 }}>إعداداتك</Text>
        <View style={{ backgroundColor: colors.surface, borderRadius: 20, borderWidth: 1, borderColor: colors.border, paddingHorizontal: 15 }}>
          {menuItems.map((item, index) => (
            <Pressable key={item.title} onPress={() => handleMenu(item.title)} style={({ pressed }) => [{ flexDirection: "row-reverse", alignItems: "center", paddingVertical: 16, opacity: pressed ? 0.65 : 1, borderBottomWidth: index === menuItems.length - 1 ? 0 : 1, borderBottomColor: colors.border }]}>
              <View style={{ width: 40, height: 40, borderRadius: 13, backgroundColor: "#EAF6F4", alignItems: "center", justifyContent: "center" }}><Text style={{ color: colors.primary, fontSize: 20, fontWeight: "700" }}>{item.icon}</Text></View>
              <View style={{ flex: 1, marginRight: 12 }}><Text style={{ color: colors.foreground, fontSize: 14, fontWeight: "800", textAlign: "right" }}>{item.title}</Text><Text style={{ color: colors.muted, fontSize: 11, textAlign: "right", marginTop: 4 }}>{item.subtitle}</Text></View>
              <Text style={{ color: colors.muted, fontSize: 22 }}>‹</Text>
            </Pressable>
          ))}
        </View>
        <View style={{ alignItems: "center", marginTop: 32 }}><Text style={{ color: colors.muted, fontSize: 11 }}>صيدلي · رعاية أقرب، كل يوم</Text><Text style={{ color: colors.border, fontSize: 11, marginTop: 6 }}>الإصدار 1.0.0</Text></View>
      </ScrollView>
    </ScreenContainer>
  );
}
