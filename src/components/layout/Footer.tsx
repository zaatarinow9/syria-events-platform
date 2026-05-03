import { ShieldAlert } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-gray-200 bg-white py-10 mt-auto">
      <div className="container mx-auto px-4 text-center">
        <div className="flex justify-center mb-4">
          <ShieldAlert className="h-6 w-6 text-gray-400" />
        </div>
        <p className="text-sm text-gray-500 mb-4 max-w-2xl mx-auto leading-relaxed">
          هذه المنصة لا تمثل أي جهة حكومية ولا تمنح تراخيص رسمية. هي أداة تنظيمية مدنية مستقلة تهدف لمساعدة الأفراد والجهات على تجهيز أوراقهم بشكل قانوني واحترافي.
        </p>
        <p className="text-xs text-gray-400 font-bold">
          © {new Date().getFullYear()} منصة الفعاليات المدنية السورية. جميع الحقوق محفوظة.
        </p>
      </div>
    </footer>
  );
}