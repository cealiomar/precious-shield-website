'use client';

/* oxlint-disable next/no-img-element -- Shared with the static GitHub Pages build; artwork is already optimized. */

import { useState } from 'react';
import {
  ScrollExperience,
  ScrollWords,
  MotionHeading,
  HoverLabel,
} from './scroll-experience';
import { assetPath } from '@/lib/asset-path';
import { InstallationVideo } from './installation-video';
import {
  ArrowDown,
  ArrowDownLeft,
  ArrowUpLeft,
  ArrowUp,
  ShieldCheck,
  Sparkles,
  Layers3,
  Menu,
  X,
} from 'lucide-react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetTitle,
  SheetDescription,
  SheetClose,
} from '@/components/ui/sheet';

const links = [
  { href: '#protection', label: 'عالم الحماية' },
  { href: '#finishes', label: 'منتجاتنا' },
  { href: '#craft', label: 'عناية بالتفاصيل' },
];
const finishes = [
  {
    id: 'crystal',
    number: '01',
    en: 'GLOSS FINISH',
    title: 'صفاء يحفظ كل انعكاس.',
    name: 'PS CRYSTAL',
    warranty: '10',
    years: 'سنوات ضمان',
    finish: 'تشطيب لامع',
    description:
      'تشطيب لامع للحفاظ على حضور سيارتك الأصلي. PS CRYSTAL يجمع الحماية مع إطلالة صافية، بضمان لمدة 10 سنوات.',
    tags: ['تشطيب لامع', 'ضمان 10 سنوات', 'حماية الطلاء'],
  },
  {
    id: 'titanium',
    number: '02',
    en: 'GLOSS FINISH',
    title: 'حضور لامع. ثقة أطول.',
    name: 'PS TITANIUM',
    warranty: '12',
    years: 'سنة ضمان',
    finish: 'تشطيب لامع',
    description:
      'اختيار لامع بضمان هو الأطول ضمن مجموعة PS. حماية لطلاء سيارتك مع تشطيب Gloss وضمان لمدة 12 سنة.',
    tags: ['تشطيب لامع', 'ضمان 12 سنة', 'حماية الطلاء'],
  },
  {
    id: 'satin',
    number: '03',
    en: 'SATIN MATTE FINISH',
    title: 'أناقة الساتان. بتوقيعك.',
    name: 'PS SATIN',
    warranty: '10',
    years: 'سنوات ضمان',
    finish: 'ساتان مطفي',
    description:
      'تشطيب ساتان مطفي يمنح خطوط السيارة حضورًا هادئًا ومميزًا. PS SATIN بضمان لمدة 10 سنوات.',
    tags: ['ساتان مطفي', 'ضمان 10 سنوات', 'حماية الطلاء'],
  },
  {
    id: 'stealth',
    number: '04',
    en: 'STANDARD MATTE FINISH',
    title: 'شخصية تحب الاختلاف.',
    name: 'PS STEALTH',
    warranty: '10',
    years: 'سنوات ضمان',
    finish: 'مطفي قياسي',
    description:
      'لمن يفضّل التشطيب المطفي القياسي. PS STEALTH يمنح السيارة إطلالة Matte، مع ضمان لمدة 10 سنوات.',
    tags: ['مطفي قياسي', 'ضمان 10 سنوات', 'حماية الطلاء'],
  },
  {
    id: 'color',
    number: '05',
    en: 'COLOR FINISH',
    title: 'لونك. تعبيرك. حمايتك.',
    name: 'PS COLOR',
    warranty: '7',
    years: 'سنوات ضمان',
    finish: 'تشطيب ملون',
    description:
      'مساحة جديدة للتعبير عن ذوقك بتشطيب ملون. PS COLOR بضمان لمدة 7 سنوات. تواصل معنا لاستكشاف الألوان المتاحة.',
    tags: ['تشطيب ملون', 'ضمان 7 سنوات', 'شخصية متجددة'],
  },
  {
    id: 'vision',
    number: '06',
    en: 'PS VISION',
    title: 'اختيار آخر من عالم PS.',
    name: 'PS VISION',
    warranty: '1',
    years: 'سنة ضمان',
    finish: 'تعرّف على المواصفات',
    description:
      'PS VISION ضمن عائلة Precious Shield، بضمان لمدة سنة واحدة. تواصل معنا لمعرفة المواصفات والتطبيق المناسب لسيارتك.',
    tags: ['ضمان سنة واحدة', 'Precious Shield'],
  },
];

const carDescriptions: Record<string, string> = {
  crystal: 'كوبيه رياضية بيضاء بتشطيب لامع — تصوير CGI توضيحي لـ PS CRYSTAL',
  titanium:
    'سيدان رياضية جرافيت بتشطيب معدني لامع — تصوير CGI توضيحي لـ PS TITANIUM',
  satin: 'سيارة كروس أوفر بلون شامبين ساتان — تصوير CGI توضيحي لـ PS SATIN',
  stealth: 'سيارة دفع رباعي سوداء بتشطيب مطفي — تصوير CGI توضيحي لـ PS STEALTH',
  color: 'سيارة سوبركار خضراء بلون زمردي لامع — تصوير CGI توضيحي لـ PS COLOR',
  vision: 'سيدان فاخرة فضية — تصوير CGI توضيحي لـ PS VISION',
};

function Logo() {
  return (
    <span className="brand-mark">
      <img
        src={assetPath('/images/ps-logo.png')}
        alt="PS"
        width="595"
        height="842"
      />
    </span>
  );
}

export default function Home() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <>
      <ScrollExperience />
      <a href="#main" className="skip-link">
        انتقل إلى المحتوى
      </a>
      <header className="site-header">
        <a className="brand" href="#home" aria-label="PS — الصفحة الرئيسية">
          <Logo />
          <span className="brand-name" dir="ltr">
            PRECIOUS SHIELD
            <br />
            <span>PAINT PROTECTION FILMS</span>
          </span>
        </a>
        <nav className="desktop-nav" aria-label="التنقل الرئيسي">
          {links.map((link) => (
            <a key={link.href} href={link.href}>
              <HoverLabel>{link.label}</HoverLabel>
            </a>
          ))}
          <a
            href="https://preciousshield.com/#console"
            target="_blank"
            rel="noopener noreferrer"
          >
            تحقّق من ضمانك
          </a>
        </nav>
        <a
          className="header-cta"
          href="https://wa.me/19406194638"
          target="_blank"
          rel="noopener noreferrer"
        >
          <HoverLabel>تواصل معنا</HoverLabel> <ArrowUpLeft size={17} />
        </a>
        <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
          <SheetTrigger className="mobile-menu" aria-label="فتح القائمة">
            <Menu size={23} />
          </SheetTrigger>
          <SheetContent
            className="ps-menu"
            showCloseButton={false}
            side="right"
          >
            <div className="menu-top">
              <Logo />
              <SheetClose className="icon-button" aria-label="إغلاق القائمة">
                <X />
              </SheetClose>
            </div>
            <SheetTitle className="sr-only">القائمة الرئيسية</SheetTitle>
            <SheetDescription className="sr-only">
              اكتشف أفلام الحماية والتشطيبات وطريقة التركيب.
            </SheetDescription>
            <nav>
              {links.map((link, i) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={() => setMenuOpen(false)}
                >
                  <span dir="ltr">0{i + 1}</span>
                  {link.label}
                  <ArrowUpLeft />
                </a>
              ))}
            </nav>
            <p dir="ltr">PROTECT WHAT MOVES YOU.</p>
          </SheetContent>
        </Sheet>
      </header>
      <main id="main">
        <section
          className="hero-scroll"
          id="home"
          data-chapter
          aria-labelledby="hero-title"
        >
          <div className="hero">
            <div className="hero-studio-light" aria-hidden="true" />
            <img
              className="hero-image"
              src={assetPath('/images/products/crystal.webp')}
              alt="كوبيه فاخرة بيضاء بتصوير CGI احترافي وإضاءة ستوديو ناعمة"
              width="1536"
              height="1024"
              fetchPriority="high"
            />
            <div className="hero-shade" />
            <div className="hero-content">
              <p className="eyebrow">
                <span className="red-line" />
                فن الحفاظ على التفاصيل
              </p>
              <h1 id="hero-title">
                <span className="title-line">
                  <span>جمال يستحق</span>
                </span>
                <span className="title-line">
                  <span>أن يدوم.</span>
                </span>
              </h1>
              <p className="hero-copy">
                كل خطّ فيها يستحق الحماية.
                <br />
                أفلام حماية الطلاء من Precious Shield.
              </p>
              <a className="primary-button" href="#protection">
                <HoverLabel>اكتشف عالم الحماية</HoverLabel>{' '}
                <ArrowDownLeft size={21} />
              </a>
            </div>
            <div className="hero-echo" aria-hidden="true">
              <span dir="ltr">
                PRECIOUS
                <br />
                SHIELD.
              </span>
              <p>لا تُرى. لكن تصنع الفارق.</p>
            </div>
            <div className="hero-scene-meter" aria-hidden="true">
              <span />
            </div>
            <div className="hero-bottom">
              <a className="scroll-cue" href="#protection">
                <span className="circle">
                  <ArrowDown size={17} />
                </span>
                اكتشف ما وراء اللمعان
              </a>
              <span className="hero-caption" dir="ltr">
                INVISIBLE PROTECTION.
                <br />
                <strong>UNMISTAKABLE PRESENCE.</strong>
              </span>
              <span className="section-index" dir="ltr">
                <b>01</b>
                <span />
                04
              </span>
            </div>
          </div>
        </section>
        <section
          id="protection"
          data-chapter
          className="protection section-pad"
        >
          <div className="section-heading reveal">
            <p className="eyebrow">
              <span className="red-line" />
              01 / عالم الحماية
            </p>
            <span className="english-label" dir="ltr">
              ENGINEERED TO PRESERVE.
            </span>
          </div>
          <div className="intro-grid">
            <h2 className="reading-title">
              <ScrollWords>لا تُرى.</ScrollWords>
              <br />
              <ScrollWords>لكن تصنع الفارق.</ScrollWords>
            </h2>
            <div className="intro-copy">
              <p>
                <ScrollWords>الطريق مليء بتفاصيل لا تختارها.</ScrollWords>
                <br />
                <ScrollWords>الحماية هي التفصيلة التي تختارها أنت.</ScrollWords>
              </p>
              <p>
                أفلام حماية الطلاء <b dir="ltr">PPF</b> طبقة شفافة تُركّب فوق سطح
                السيارة، تساعد على تقليل أثر الخدوش السطحية وحصى الطريق، مع
                الحفاظ على جمال الطلاء.
              </p>
              <a className="text-link" href="#finishes">
                <HoverLabel>اكتشف التشطيب المناسب لك</HoverLabel>{' '}
                <ArrowUpLeft size={19} />
              </a>
            </div>
          </div>
          <div className="benefit-grid">
            {[
              {
                Icon: ShieldCheck,
                title: 'حماية للحياة اليومية',
                body: 'طبقة إضافية بين طلاء سيارتك وآثار الطريق.',
              },
              {
                Icon: Sparkles,
                title: 'جمال التفاصيل الأصلية',
                body: 'شفافية تترك اللون والخطوط تعبّر عن نفسها.',
              },
              {
                Icon: Layers3,
                title: 'عناية تبدأ من السطح',
                body: 'التحضير الجيد ودقة التركيب جزء من النتيجة.',
              },
            ].map(({ Icon, title, body }, i) => (
              <article
                key={title}
                className="reveal"
                style={{ transitionDelay: `${i * 120}ms` }}
              >
                <div className="benefit-top">
                  <Icon size={28} strokeWidth={1.2} />
                  <span dir="ltr">0{i + 1}</span>
                </div>
                <h3>{title}</h3>
                <p>{body}</p>
              </article>
            ))}
          </div>
        </section>
        <section id="finishes" data-chapter className="finishes section-pad">
          <div className="section-heading reveal">
            <p className="eyebrow">
              <span className="red-line" />
              02 / شخصيتك، بتشطيبك
            </p>
            <span className="english-label" dir="ltr">
              SIX CHOICES. ONE STANDARD.
            </span>
          </div>
          <div className="finish-heading">
            <MotionHeading lines={['ستة اختيارات.', 'معيار واحد.']} />
            <p>
              من اللمعان الصافي إلى الساتان واللون.
              <br />
              تعرّف على عائلة Precious Shield واكتشف اختيارك.
            </p>
          </div>
          <Tabs defaultValue="crystal" className="finish-tabs reveal">
            <TabsList
              className="finish-tab-list"
              aria-label="اختيار منتج Precious Shield"
            >
              {finishes.map((product) => (
                <TabsTrigger key={product.id} value={product.id}>
                  <span className={`finish-dot ${product.id}-dot`} />
                  <span dir="ltr">{product.name}</span>
                  <small>
                    {product.warranty} {product.years}
                  </small>
                </TabsTrigger>
              ))}
            </TabsList>
            {finishes.map((finish) => (
              <TabsContent
                key={finish.id}
                value={finish.id}
                className="finish-panel"
              >
                <div className="finish-image-wrap product-car-stage">
                  <span
                    className="product-stage-word"
                    dir="ltr"
                    aria-hidden="true"
                  >
                    {finish.name.replace('PS ', '')}
                  </span>
                  <img
                    className="product-car-image"
                    src={assetPath(`/images/products/${finish.id}.webp`)}
                    alt={carDescriptions[finish.id]}
                    width={1536}
                    height={1024}
                    loading={finish.id === 'crystal' ? 'eager' : 'lazy'}
                  />
                  <span className="product-image-name" dir="ltr">
                    {finish.name}
                  </span>
                  <span className="image-note">
                    تصوّر CGI • يختلف المظهر حسب الفيلم والطلاء
                  </span>
                </div>
                <div className="finish-info">
                  <div className="product-meta">
                    <p className="english-label red-text" dir="ltr">
                      {finish.en}
                    </p>
                    <div className="warranty">
                      <strong>{finish.warranty}</strong>
                      <span>{finish.years}</span>
                    </div>
                  </div>
                  <h3>{finish.title}</h3>
                  <p>{finish.description}</p>
                  <ul>
                    {finish.tags.map((tag) => (
                      <li key={tag}>
                        <span />
                        {tag}
                      </li>
                    ))}
                  </ul>
                  <a
                    className="text-link"
                    href={`https://wa.me/19406194638?text=${encodeURIComponent('مرحبًا، أرغب في معرفة المزيد عن ' + finish.name)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <HoverLabel>استفسر عن {finish.name}</HoverLabel>{' '}
                    <ArrowUpLeft size={18} />
                  </a>
                </div>
              </TabsContent>
            ))}
          </Tabs>
          <p className="product-note">
            مدد الضمان حسب المنتج، وتخضع لشروط ضمان Precious Shield. تحقّق من
            ضمانك وفعّله عبر سجل الضمان الرقمي.
          </p>
        </section>
        <section id="craft" data-chapter className="craft">
          <div className="craft-stage">
            <div className="craft-photo craft-photo--video">
              <InstallationVideo />
            </div>
            <div className="craft-content section-pad">
              <div>
                <p className="eyebrow">
                  <span className="red-line" />
                  03 / عناية بالتفاصيل
                </p>
                <MotionHeading lines={['الفارق في', 'آخر مليمتر.']} />
                <p className="craft-lead">
                  الحماية الجيدة تبدأ قبل تركيب الفيلم.
                  <br />
                  وتكتمل بالاهتمام بكل حافة وانحناءة.
                </p>
                <ol className="steps">
                  {[
                    {
                      title: 'فهم السطح',
                      text: 'تقييم حالة الطلاء وتحديد الأجزاء المطلوب حمايتها.',
                    },
                    {
                      title: 'تحضير بعناية',
                      text: 'تنظيف وتجهيز السطح لاستقبال الفيلم.',
                    },
                    {
                      title: 'تركيب ومراجعة',
                      text: 'ضبط الفيلم، العناية بالحواف، ومراجعة التشطيب النهائي.',
                    },
                  ].map((step, i) => (
                    <li key={step.title}>
                      <span dir="ltr">0{i + 1}</span>
                      <div>
                        <h3>{step.title}</h3>
                        <p>{step.text}</p>
                      </div>
                    </li>
                  ))}
                </ol>
              </div>
            </div>
          </div>
        </section>
        <section className="closing section-pad" id="ps" data-chapter>
          <div className="section-heading">
            <p className="eyebrow">
              <span className="red-line" />
              04 / هذا هو إحساس PS
            </p>
            <span className="english-label" dir="ltr">
              PROTECT WHAT MOVES YOU.
            </span>
          </div>
          <div className="closing-main">
            <MotionHeading lines={['استمتع بالطريق.', 'واترك الحماية لنا.']} />
            <a
              href="https://wa.me/19406194638"
              target="_blank"
              rel="noopener noreferrer"
              className="closing-link"
              aria-label="تواصل مع Precious Shield على واتساب"
            >
              <ArrowUpLeft strokeWidth={1} />
            </a>
          </div>
          <div className="closing-bottom">
            <span>حماية مدروسة. جمال يدوم.</span>
            <div className="contact-links">
              <a
                className="text-link"
                href="https://wa.me/19406194638"
                target="_blank"
                rel="noopener noreferrer"
              >
                <HoverLabel>تواصل على واتساب</HoverLabel>{' '}
                <ArrowUpLeft size={18} />
              </a>
              <a
                className="text-link"
                href="https://preciousshield.com/#console"
                target="_blank"
                rel="noopener noreferrer"
              >
                <HoverLabel>تحقّق من ضمانك</HoverLabel> <ArrowUpLeft size={18} />
              </a>
            </div>
          </div>
        </section>
      </main>
      <div className="closing-wordmark-wrap" aria-hidden="true">
        <span className="closing-wordmark" dir="ltr">
          PRECIOUS SHIELD
        </span>
      </div>
      <footer>
        <a href="#home" className="brand" aria-label="العودة للرئيسية">
          <Logo />
          <span dir="ltr">PRECIOUS SHIELD</span>
        </a>
        <a className="footer-email" href="mailto:info@preciousshield.com">
          info@preciousshield.com
        </a>
        <span className="copyright">
          © {new Date().getFullYear()} Precious Shield. جميع الحقوق محفوظة.
        </span>
        <a className="back-top" href="#home">
          للأعلى <ArrowUp size={16} />
        </a>
      </footer>
    </>
  );
}
