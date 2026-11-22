# NOVA — بوابة بحث عربية

## التشغيل

ثبّت Node.js ثم شغّل `npm install` وبعدها `npm start`، وافتح `http://localhost:3000`. لا تفتح `index.html` مباشرة حتى يعمل البحث داخل الموقع.

## تشغيله كتطبيق Electron

بعد `npm install` شغّل `npm run desktop`. ستفتح نافذة NOVA كتطبيق مستقل على الكمبيوتر.

اختَر DuckDuckGo أو Google من القائمة داخل الموقع. الإعدادات موجودة في ملف `.env`؛ لا ترفع هذا الملف إلى GitHub.


## تفعيل Firebase

1. أنشئ مشروعًا في [Firebase Console](https://console.firebase.google.com/).
2. أضف تطبيق Web ثم انسخ إعداداته إلى `firebase-config.js`.
3. أنشئ Firestore Database.
4. ستُحفظ الاشتراكات في مجموعة `subscribers` وسجلّات البحث في مجموعة `searches`.
5. انسخ قواعد `firestore.rules` إلى تبويب Rules في Firebase قبل النشر.

> الواجهة تعمل في وضع تجريبي قبل إضافة إعدادات Firebase، لكن البيانات لن تُحفظ في قاعدة بيانات حتى تضع الإعدادات الحقيقية.
