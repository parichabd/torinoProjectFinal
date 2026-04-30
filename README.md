<div style="font-family: 'B Nazanin', Tahoma, sans-serif; direction: rtl;">
<div align="center" id="readme-top">
    <img src="https://github.com/parichabd/exam/blob/main/public/images-md/logo.png?raw=true" alt="Logo" width="80" height="80">
</div>

<h3 align="center">پروژه تورینو</h3>
 <p align="center">
    با چند کلیک آماده سفر به هر جایی!
</p>

## درباره پروژه

![Product Name Screen Shot](https://github.com/parichabd/exam/blob/main/public/images-md/hal-gatewood-weRQAu9TA-A-unsplash.jpg?raw=true)

همانطور که مشخص هست این پروژه برای رزرو و خرید و بررسی انواع بلیط های مسافرتی ساخته شده است که این امکان را به مراجعه کنند می دهد در کمترین زمان ممکن بهترین بلیط مورد نظر را از لحاظ قیمت و زمان بندی رزرو کند .
این پروژه به صورت پایه با نکست ورژن **_13_** نوشته خواهد شد که اساس صفحه بندی بر مبنای اپ هست .

---

### ساختار پایه

<div align="right" >

[![Next][Next.js]][Next-url]
[![React][React.js]][React-url]
[![JavaScript][JavaScript.js]][JavaScript-url]
[![CSS][CSS]][CSS-url]

</div>

<br><br><br>

### ۱. پکیج های مورد استفاده در پروژه

در این قسمت انواع پکیج های مورد نیاز در این پروژه را مورد بررسی قرار خواهیم داد
با توجه به اینکه پروژه شامل احراز هویت، جستجوی سفر، رزرو بلیط و مدیریت حساب کاربری است، استفاده از کتابخانه‌های مدیریت فرم، اعتبارسنجی داده و مدیریت استیت سراسری ضروری است.
<br><br>

<div align="left">

- Next

```bash
1.  npx create-next-app@latest torino
```

>  برای نصب اولیه نکست لازم است

---

<br>

- Client side manage state and API

```bash
2. npm install @tanstack/react-query @tanstack/react-query-devtools
```

> برای راحتی اتصال به بک اند بدون نوشتن useEffect میتوان کارهایی از جمله :‌ گرفتن لیست تورها از بک‌اند دریافت جزئیات تور برای صفحه‌ی مدیریت داده‌های رزرو بلیط و تراکنش‌ها ذخیره موقت (cache) داده‌ها برای افزایش سرعت UI و کاهش درخواست‌ها به سرور : بدون نیاز به نوشتن state و useEffect پیچیده، داده‌ها به صورت خودکار fetch، cache و sync می‌شوند و راحتی Debug و مانیتورینگ را افزایش می‌دهد

## مدیریت server state : لیست تورها

<br>

- Forms and validations

```bash
3. npm install react-hook-form yup
```

> برای فرم ورود با شماره تلفن و دریافت پیامک و همچنین فرم های جستوجوی تورها و رزرو بلیط که منجر به کاهش رندر اضافی مدیریت ساده تر انواع خطا و اعتبار سنجی آسان و ادغام با یاپ برای ولیدیشن خواهد شد .

---

<br>

- Icons

```bash
4. npm install react-icons
```

> یک سری از نماد ها و آیکون هایی که میتواند به خوانایی و مفهوم داکیمونت ها کمک کند .

---

<br>

- State Management

```js
5. import { createContext, useContext } from "react"
6. npm install zustand
```

> این کتابخانه کمک میکند با پایبندی به اصل dry اطلاعاتی که شاید در چند کامپوننت نیاز هستند بدون لیفت کردن های پی در پی به ان ها دسترسی داشت .
> کتابخانه سبک برای مدیریت state سراسری
> ذخیره وضعیت لاگین کاربر
> نگهداری اطلاعات رزرو یا سبد خرید
> ساده، سریع و سبک، نیازی به Redux پیچیده ندارد

## مدیریت client state (UI state)

<br>

- Modern Slider for pics

```bash
7. npm install swiper
```

> کمک به نمایش چند عکس روی هم یا با حرکت نرم و اسلاید
> نمایش تصاویر تور در بخش پایین صفحه یا کنار توضیحات

---

<br>

- Date UI

```bash
8. npm install react-multi-date-picker
```

> میتونه دقیقاً مثل فیگما، رنگ، فونت، و تقویم شمسی بسازد و کاملاً خصوصی باشه.

---

<br>

- Authentication & Authorazations

```bash
9. npm install next-auth
```

> بررسی احراز هویت OPT و مجاز بودن دسترسی کاربر در صفحات

---

<br>

</div>

### ۲. آیا این پروژه به گلوبال استیت منیج احتیاجی دارد ؟‌

> به صورت مختصر اگر بخواهیم به این موضوع بپردازیم در بخشی از قسمت ها بله شاید لازم باشد چرا که بعضی از قسمت ها اطلاعات استور شده شاید در چند بخش مورد نیاز باشند مانند
> بخش هایی که UI و وضعیت کاربر است ولی بخش هایی که اطلاعات ان حساس هستند مانند اطلاعات حساب بانکی و تراکنش ها نیازی نیستد اطلاعات حساس مانند تراکنش‌ها و اطلاعات بانکی بهتر است مستقیماً از سرور و با SSR دریافت شوند تا همیشه تازه و امن باشند و در کلاینت ذخیره نشوند. .
> به صورت کلی شاید در این بخش ها نیاز به گلوبال استیت ها باشد :

- وضعیت لاگین
- تم
- مودال‌ها
- سبد خرید موقت
- مرحله فعلی رزرو

---

<br>

### ۳. بررسی تعداد صفحاتی که قراره پیاده سازی شود و نوع رندر شدن هر صفحه

| صفحه                                           | توضیح                                 | رندرینگ                                                                                                                    |
| ---------------------------------------------- | ------------------------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| صفحات ثابت (درباره ما، تماس با ما، قوانین و …) | محتوای ثابت و تغییر ناپذیر            | SSG (یکبار ساخته می‌شوند و همه کاربران دریافت می‌کنند)                                                                     |
| صفحه ۵۰۰ / ۴۰۴                                 | صفحات خطا                             | SSG یا حتی static (چون ثابت هستند)                                                                                         |
| صفحه اصلی (قبل ورود)                           | نمایش محتوا و باکس جستجو              | CSR یا ترکیبی CSR + SSR: - بخش جستجو CSR (چون بعد از ورود نیاز به اطلاعات کاربر دارد)- بخش معرفی/تصاویر می‌تواند SSG باشد  |
| صفحه ورود و ثبت نام (مودال)                    | شامل فرم شماره تلفن و OTP             | CSR (تمام فرم‌ها و تعاملات سمت کلاینت است، NextAuth session مدیریت می‌کند)                                                 |
| صفحه جزئیات تور                                | نمایش تور انتخاب شده و اطلاعات        | SSR یا ISR - چون اطلاعات تور پویا هستند و ممکن است تغییر کنند- ISR اگر بخواهیم صفحات استاتیک ولید کنیم ولی گاهی آپدیت شوند |
| صفحه نتایج جستجو                               | نمایش تورها بر اساس مبدا، مقصد، تاریخ | CSR (نتایج جستجو بستگی به ورودی کاربر دارد و سمت کلاینت fetch می‌شود، React Query مناسب)                                   |
| صفحه رزرو / خرید                               | اطلاعات تور رزرو شده و خرید           | SSR (برای اطمینان از اطلاعات درست کاربر و تور)                                                                             |
| صفحه حساب کاربری – پروفایل                     | ویرایش اطلاعات کاربر                  | SSR + CSR - SSR برای گرفتن اطلاعات اولیه کاربر- CSR برای فرم و تعاملات و تغییرات لحظه‌ای                                   |
| صفحه حساب کاربری – تورهای من                   | لیست تورهای رزرو شده                  | SSR یا CSR ترکیبی - SSR برای initial fetch- CSR برای pagination یا فیلترهای بعدی                                           |
| صفحه حساب کاربری – تراکنش‌ها                   | نمایش تراکنش‌ها و رسیدها              | SSR یا CSR ترکیبی - اطلاعات حساس و پویا، SSR امن‌تر است، CSR برای تعاملات و جستجو                                          |

> جمعا این پروژه شاید نیاز به ۲۰ صفحه خواهد داشت این معیار حدسی است و آمار دقیق حین کد مشخص خواهد شد !

---

### ۴. نمودار درختی پروژه

<div align="left">

```
torino-travel/
├── public/          # Static assets like images,
│ ├── images/
│ ├── icons/
│ └── fonts/

├── src/
│ ├── app/
│ │
│ │ ├── api/            # API routes
│ │ │ └── auth/
│ │ │ └── [...nextauth]/
│ │ │ └── route.js      # Route group with pages and components
│ │ │
│ │ ├── (public)/ # صفحات عمومی
│ │ │ ├── layout.js # layout عمومی (header + footer)
│ │ │ ├── page.js # صفحه اصلی
│ │ │ ├── loading.js
│ │ │ │
│ │ │ ├── about/
│ │ │ │ └── page.js
│ │ │ │
│ │ │ ├── contact/
│ │ │ │ └── page.js
│ │ │ │
│ │ │ ├── tours/
│ │ │ │ ├── page.js # نتایج جستجو
│ │ │ │ ├── loading.js
│ │ │ │ ├── error.js
│ │ │ │ │
│ │ │ │ └── [id]/
│ │ │ │ ├── page.js # جزئیات تور
│ │ │ │ ├── loading.js
│ │ │ │ ├── error.js
│ │ │ │ └── not-found.js
│ │ │
│ │ ├── booking/
│ │ │ ├── page.js # صفحه ثبت و خرید
│ │ │ ├── loading.js
│ │ │ └── error.js
│ │ │
│ │ ├── (auth)/ # احراز هویت
│ │ │ └── login/
│ │ │ └── page.js # اگر مودال نبود
│ │
│ │ ├── (dashboard)/ # صفحات بعد از ورود
│ │ │ ├── layout.js # layout داشبورد (sidebar)
│ │ │ │
│ │ │ ├── profile/
│ │ │ │ └── page.js
│ │ │ │
│ │ │ ├── my-tours/
│ │ │ │ ├── page.js
│ │ │ │ └── loading.js
│ │ │ │
│ │ │ └── transactions/
│ │ │ ├── page.js
│ │ │ └── loading.js
│ │ │
│ │ ├── not-found.js # 404 سراسری
│ │ ├── global-error.js # خطای کلی اپ
│ │ ├── layout.js # Root Layout
│ │ └── globals.css
│ │
│ ├── components/
│ │ ├── layout/
│ │ │ ├── Header.js
│ │ │ ├── Footer.js
│ │ │ └── DashboardSidebar.js
│ │ │
│ │ ├── ui/
│ │ │ ├── Button.js
│ │ │ ├── Input.js
│ │ │ ├── Modal.js
│ │ │ └── Loader.js
│ │ │
│ │ ├── tour/
│ │ │ ├── TourCard.js
│ │ │ ├── TourSearchBox.js
│ │ │ └── DatePicker.js
│ │ │
│ │ └── auth/
│ │ └── LoginModal.js
│ │
│ ├── hooks/
│ │ ├── useAuth.js
│ │ ├── useTours.js
│ │ └── useBooking.js
│ │
│ ├── lib/
│ │ ├── authOptions.js
│ │ ├── fetcher.js
│ │ └── apiConfig.js
│ │
│ ├── utils/
│ │ ├── formatPrice.js
│ │ ├── formatDate.js
│ │ └── validators.js
│ │
│ └── styles/
│ ├── variables.module.css
│ └── mixins.module.css
│
├── .env.local
├── next.config.js
├── package.json
└── jsconfig.json

```

> در این پروژه ساختار مبتنی بر App Router انتخاب شد زیرا این معماری امکان مدیریت بهتر صفحات پویا، احراز هویت، مدیریت خطا و تجربه کاربری بهینه‌تر را فراهم می‌کند. همچنین با تفکیک بخش‌های عمومی و داشبورد، توسعه و نگهداری پروژه در مقیاس بزرگ‌تر ساده‌تر خواهد بود.
> 📍 این ساختار احتمالا تغییراتی خواهد داشت !

<br>
</div>

### ۵. به نظرتون پیاده سازی کدوم بخش ها از پروژه چالش بیشتری براتون داره؟ اون هارو نام ببرسید مختصر توضیح بدید.

> از نطر من مدیریت OTP و expiration time و جلوگیری از double booking در پرداخت و همگام‌سازی موجودی تور هنگام خرید همزمان چند کاربر
> چالش بر انگیز تر از بقیه ی قسمت ها خواهد بود هر چند تمامی بخش ها برای من با توجه به یک ماه فاصله از مباحث پیچیده به نظر میاید 😊

<br>

### ۶. قسمت هایی که دارای الگو تکراری هستن

- Layout عمومی
- Header
- Footer
- Button
- Input
- Card تورها
- Modal ورود/ثبت نام
- Loader / Spinner
- Error / Not Found
- Pagination

---

### ۷. هر ابهامی درباره UI در قالب یک سوال واضح بنویسید

<br>

تاریخ شمسی همراه با اعداد فارسی و لیبل چگونه پیدا سازی شده ؟‌

> متوجه شدم کتابخانه میخواد

وسط چین کردن و سه اینپوت همزمان در قسمت سرچ تور ؟

> در حال بررسی ....

اسلاید شدن چند عکس بر روی یک دیگر چگونه اتفاق می افتد ؟

> کتوجه شدم با کتابخانه امکان پذیر است

ثانیه شمار ارسال مجدد کد و مکعب های ورودی اعداد پیامک شده ؟

> در حال بررسی ....
> <br>
> <br>

---

## نویسنده

<a href="https://github.com/parichabd">
  <img 
    src="https://github.com/parichabd/Parichehr-Abedzadeh_week21/blob/main/Screenshots/m.jpg?raw=true"
    width="60px"
    height="60px"
    style="border-radius:50%; object-fit:cover;"
  />
</a>
<br>
<br>

پریچهر عابدزاده

نشانی ایمیل :‌ parichehrabedzadeh@gmail.com

<br>
<br>
<br>
<br>
<p align="right"><a href="#readme-top">برگشت به بالا</a></p>

[Next.js]: https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white
[Next-url]: https://nextjs.org/
[React.js]: https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB
[React-url]: https://reactjs.org/
[CSS]: https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white
[CSS-url]: https://developer.mozilla.org/en-US/docs/Web/CSS
[JavaScript.js]: https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=000
[JavaScript-url]: https://developer.mozilla.org/en-US/docs/Web/JavaScript

</div>
