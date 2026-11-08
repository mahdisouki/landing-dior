import { FormEvent, useEffect, useRef, useState } from "react";
import cutiesLogo from "./assets/cuties-logo.png";
import watchGold from "./assets/watch-gold.jpg";
import watchSilver from "./assets/watch-silver.jpg";
import watchTwotone from "./assets/watch-twotone.jpg";

const PROMO_VIDEO =
  "https://res.cloudinary.com/dfxeaeebv/video/upload/v1794165539/promo-video_g9odgx.mp4";
const STOCK = 21;
const WATCH_PRICE = 59;
const DELIVERY_PRICE = 7;

const governorates = [
  "تونس",
  "أريانة",
  "بن عروس",
  "منوبة",
  "نابل",
  "زغوان",
  "بنزرت",
  "باجة",
  "جندوبة",
  "الكاف",
  "سليانة",
  "سوسة",
  "المنستير",
  "المهدية",
  "صفاقس",
  "القيروان",
  "القصرين",
  "سيدي بوزيد",
  "قابس",
  "مدنين",
  "تطاوين",
  "قفصة",
  "توزر",
  "قبلي",
];

const colors = [
  { id: "gold", label: "ذهبي", image: watchGold, variantId: "g", stock: 10 },
  { id: "silver", label: "فضي", image: watchSilver, variantId: "b", stock: 6 },
  {
    id: "twotone",
    label: "ذهبي-فضي",
    image: watchTwotone,
    variantId: "default",
    stock: 5,
  },
];

type FormData = {
  name: string;
  phone: string;
  governorate: string;
  address: string;
  color: string;
  quantity: number;
  website: string;
};

const initialForm: FormData = {
  name: "",
  phone: "",
  governorate: "",
  address: "",
  color: "gold",
  quantity: 1,
  website: "",
};

function scrollToOrder() {
  document.getElementById("order")?.scrollIntoView({ behavior: "smooth", block: "start" });
}

function App() {
  const [selectedColor, setSelectedColor] = useState("gold");
  const [form, setForm] = useState<FormData>(initialForm);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const pageRef = useRef<HTMLDivElement>(null);

  const total = WATCH_PRICE * form.quantity + DELIVERY_PRICE;

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12 },
    );

    const elements = pageRef.current?.querySelectorAll(".reveal") ?? [];
    elements.forEach((element) => observer.observe(element));
    return () => observer.disconnect();
  }, []);

  const chooseColor = (color: string) => {
    if (!colors.find((option) => option.id === color)?.stock) return;
    setSelectedColor(color);
    setForm((current) => ({ ...current, color }));
  };

  const validate = () => {
    const nextErrors: Record<string, string> = {};
    if (form.name.trim().length < 3) nextErrors.name = "اكتب الإسم و اللقب";
    if (!/^[2459]\d{7}$/.test(form.phone)) nextErrors.phone = "ادخل رقم تونسي صحيح";
    if (!form.governorate) nextErrors.governorate = "خيّر الولاية";
    if (form.address.trim().length < 5) nextErrors.address = "اكتب العنوان الكامل";
    if (!form.color) nextErrors.color = "خيّر اللون";
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const submitOrder = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (form.website || !validate()) return;

    const endpoint = import.meta.env.VITE_FORM_ENDPOINT;
    if (!endpoint) {
      setStatus("error");
      return;
    }

    setStatus("submitting");
    try {
      const selectedVariant = colors.find((color) => color.id === form.color);
      if (!selectedVariant?.stock || selectedVariant.stock < form.quantity) {
        setErrors({ color: "اللون هذا موش متوفر بالكمية المطلوبة" });
        setStatus("idle");
        return;
      }

      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name.trim(),
          phone: form.phone,
          address: `${form.governorate}، ${form.address.trim()}`,
          items: [
            {
              productId: "navy-twotone",
              variantId: selectedVariant.variantId,
              quantity: form.quantity,
            },
          ],
        }),
      });
      if (!response.ok) throw new Error("Submission failed");

      // Meta Pixel placeholder: sends Lead only when the site owner has installed fbq.
      const pixel = (window as Window & { fbq?: (...args: unknown[]) => void }).fbq;
      pixel?.("track", "Lead", { value: total, currency: "TND" });
      setStatus("success");
    } catch {
      setStatus("error");
    }
  };

  return (
    <div ref={pageRef} dir="rtl" className="site-shell">
      <div className="delivery-bar">🚚 توصيل لكامل تونس · الدفع عند الاستلام</div>

      <main>
        <section className="hero section">
          <div className="hero-copy">
            <a href="#top" className="brand" aria-label="Cuties.tn">
              <img src={cutiesLogo} alt="Cuties.tn" />
            </a>
            <p className="eyebrow">لمعة تكمّل طلّتك</p>
            <h1>
              شكلها غالي…
              <br />
              <span className="gold-text">وسعرها لا ✨</span>
            </h1>
            <p className="hero-sub">ساعة نسائية فخمة بإطار لامع — 59 دينار برك</p>
            <button className="gold-button shine" type="button" onClick={scrollToOrder}>
              أطلب توا 👇
            </button>
            <p className="micro-copy">تخلّص كان كي توصلك</p>
          </div>

          <div className="hero-product" aria-label="ساعة نسائية ذهبية">
            <div className="halo" />
            <div className="price-badge">
              <strong>59 د</strong>
              <span>+ 7 د توصيل</span>
            </div>
            <img src={watchGold} alt="ساعة Cuties ذهبية فوق رخام أسود" />
          </div>
        </section>

        <section className="scarcity reveal" aria-label="الكمية المتوفرة">
          <div className="scarcity-row">
            <strong>⚡ كمية محدودة: {STOCK} قطعة برك</strong>
            <span>ما تستناش</span>
          </div>
          <div className="stock-track">
            <div
              className="stock-fill"
              style={{ width: `${Math.min((STOCK / 25) * 100, 100)}%` }}
            />
          </div>
        </section>

        <section className="gift section reveal">
          <p className="eyebrow">هدية تبقى في البال</p>
          <h2>هدية تفرح قلبها 💎</h2>
          <p>عيد ميلاد؟ خطوبة؟ عيد الأم؟</p>
          <div className="gift-divider">
            <span />
            <b>كل مناسبة تولّي أغلى</b>
            <span />
          </div>
        </section>

        <section className="video-section section reveal">
          <div className="section-heading">
            <p className="eyebrow">التفاصيل تحكي وحدها</p>
            <h2>شوفها بعينك ✨</h2>
          </div>
          <div className="video-frame">
            <video controls playsInline preload="metadata" poster={watchGold}>
              <source src={PROMO_VIDEO} type="video/mp4" />
            </video>
            <span className="video-label">Cuties.tn</span>
          </div>
        </section>

        <section className="colors-section section reveal">
          <div className="section-heading">
            <p className="eyebrow">ثلاثة ألوان، نفس الفخامة</p>
            <h2>خيّر لونك</h2>
          </div>
          <div className="color-grid">
            {colors.map((color) => (
              <button
                key={color.id}
                type="button"
                className={`color-card ${selectedColor === color.id ? "selected" : ""} ${color.stock === 0 ? "sold-out" : ""}`}
                onClick={() => chooseColor(color.id)}
                aria-pressed={selectedColor === color.id}
                disabled={color.stock === 0}
              >
                <div className="color-image-wrap">
                  <img src={color.image} alt={`ساعة باللون ${color.label}`} />
                  {selectedColor === color.id && <span className="check">✓</span>}
                </div>
                <strong>{color.label}</strong>
                <span>
                  {color.stock === 0
                    ? "نفد المخزون"
                    : selectedColor === color.id
                      ? `مختار · باقي ${color.stock}`
                      : `إختار · باقي ${color.stock}`}
                </span>
              </button>
            ))}
          </div>
        </section>

        <section className="price-panel section reveal">
          <p className="eyebrow">سوم واضح، بلا مفاجآت</p>
          <div className="price-lines">
            <div>
              <span>الساعة</span>
              <strong>59 د</strong>
            </div>
            <div>
              <span>التوصيل</span>
              <strong>7 د</strong>
            </div>
            <div className="price-total">
              <span>المجموع عند الاستلام</span>
              <strong>66 د</strong>
            </div>
          </div>
        </section>

        <section className="steps section reveal">
          <div className="section-heading">
            <p className="eyebrow">الطلب ساهل</p>
            <h2>3 خطوات وتوصلك</h2>
          </div>
          <div className="steps-grid">
            {[
              ["01", "عمّر الفورم"],
              ["02", "نتصلو بيك نأكدو"],
              ["03", "توصلك وتخلص"],
            ].map(([number, label]) => (
              <div className="step" key={number}>
                <span>{number}</span>
                <strong>{label}</strong>
              </div>
            ))}
          </div>
        </section>

        <section className="faq section reveal">
          <div className="section-heading">
            <p className="eyebrow">عندك سؤال؟</p>
            <h2>الأسئلة المتكررة</h2>
          </div>
          <details>
            <summary>
              كيفاش نخلص؟ <span>+</span>
            </summary>
            <p>تخلّص كي تستلم ساعتك، من غير دفع مسبق.</p>
          </details>
          <details>
            <summary>
              قداش التوصيل؟ <span>+</span>
            </summary>
            <p>7 د لكامل ولايات تونس.</p>
          </details>
        </section>

        <section id="order" className="order-section section reveal">
          <div className="order-card">
            {status === "success" ? (
              <div className="success-message" role="status">
                <span className="success-icon">✓</span>
                <p className="eyebrow">طلبك وصلنا</p>
                <h2>بارك الله فيك! ✅</h2>
                <p>باش نتصلو بيك لتأكيد الطلب</p>
              </div>
            ) : (
              <>
                <div className="order-heading">
                  <p className="eyebrow">الدفع عند الاستلام</p>
                  <h2>أطلب ساعتك توا 🚚</h2>
                  <p>عمّر معلوماتك ونكلموك نأكدو معاك.</p>
                </div>

                <form onSubmit={submitOrder} noValidate>
                  <label>
                    الإسم و اللقب
                    <input
                      value={form.name}
                      onChange={(event) => setForm({ ...form, name: event.target.value })}
                      placeholder="مثال: آمنة بن سالم"
                      autoComplete="name"
                      aria-invalid={!!errors.name}
                    />
                    {errors.name && <small>{errors.name}</small>}
                  </label>

                  <label>
                    رقم التليفون
                    <input
                      type="tel"
                      inputMode="numeric"
                      value={form.phone}
                      maxLength={8}
                      onChange={(event) =>
                        setForm({ ...form, phone: event.target.value.replace(/\D/g, "") })
                      }
                      placeholder="مثال: 20123456"
                      autoComplete="tel"
                      dir="ltr"
                      aria-invalid={!!errors.phone}
                    />
                    {errors.phone && <small>{errors.phone}</small>}
                  </label>

                  <label>
                    الولاية
                    <select
                      value={form.governorate}
                      onChange={(event) => setForm({ ...form, governorate: event.target.value })}
                      aria-invalid={!!errors.governorate}
                    >
                      <option value="">خيّر الولاية</option>
                      {governorates.map((governorate) => (
                        <option key={governorate}>{governorate}</option>
                      ))}
                    </select>
                    {errors.governorate && <small>{errors.governorate}</small>}
                  </label>

                  <label>
                    العنوان الكامل
                    <textarea
                      value={form.address}
                      onChange={(event) => setForm({ ...form, address: event.target.value })}
                      placeholder="المدينة، النهج، رقم الدار..."
                      autoComplete="street-address"
                      aria-invalid={!!errors.address}
                    />
                    {errors.address && <small>{errors.address}</small>}
                  </label>

                  <fieldset>
                    <legend>اللون</legend>
                    <div className="radio-grid">
                      {colors.map((color) => (
                        <label
                          key={color.id}
                          className={`${form.color === color.id ? "active" : ""} ${color.stock === 0 ? "sold-out" : ""}`}
                        >
                          <input
                            type="radio"
                            name="color"
                            value={color.id}
                            checked={form.color === color.id}
                            onChange={() => chooseColor(color.id)}
                            disabled={color.stock === 0}
                          />
                          {color.label}
                          {color.stock === 0 && " · نفد"}
                        </label>
                      ))}
                    </div>
                    {errors.color && <small className="field-error">{errors.color}</small>}
                  </fieldset>

                  <fieldset>
                    <legend>الكمية</legend>
                    <div className="quantity-grid">
                      {[1, 2, 3].map((quantity) => (
                        <label
                          key={quantity}
                          className={form.quantity === quantity ? "active" : ""}
                        >
                          <input
                            type="radio"
                            name="quantity"
                            value={quantity}
                            checked={form.quantity === quantity}
                            onChange={() => setForm({ ...form, quantity })}
                          />
                          {quantity}
                        </label>
                      ))}
                    </div>
                  </fieldset>

                  <label className="honeypot" aria-hidden="true">
                    Website
                    <input
                      tabIndex={-1}
                      autoComplete="off"
                      value={form.website}
                      onChange={(event) => setForm({ ...form, website: event.target.value })}
                    />
                  </label>

                  <div className="live-total">
                    <span>
                      المجموع{" "}
                      <small>
                        ({form.quantity} × {WATCH_PRICE} د + التوصيل)
                      </small>
                    </span>
                    <strong>{total} د</strong>
                  </div>

                  {status === "error" && (
                    <p className="submit-error" role="alert">
                      صار مشكل في إرسال الطلب. عاود جرّب بعد شوية.
                    </p>
                  )}

                  <button
                    className="gold-button shine submit-button"
                    disabled={status === "submitting"}
                  >
                    {status === "submitting" ? "قاعدين نبعثو..." : "نأكد طلبي 🚚"}
                  </button>
                  <p className="secure-note">معلوماتك في أمان · الدفع عند الاستلام</p>
                </form>
              </>
            )}
          </div>
        </section>

        <section className="final-cta section reveal">
          <p className="eyebrow">الفرصة قدّامك</p>
          <h2>ما تفوتهاش… {STOCK} قطعة برك ⏳</h2>
          <p>ساعة تلمع في يدك، بسوم ما يتعاودش.</p>
          <button className="gold-button shine" type="button" onClick={scrollToOrder}>
            نحب نطلب توا
          </button>
        </section>
      </main>

      <footer>
        <a className="brand footer-brand" href="#top" aria-label="Cuties.tn">
          <img src={cutiesLogo} alt="Cuties.tn" />
        </a>
        <p>أناقة توصلك لباب الدار</p>
      </footer>

      <div className="mobile-order-bar">
        <div>
          <strong>59 د</strong>
          <span>الدفع عند الاستلام</span>
        </div>
        <button type="button" onClick={scrollToOrder}>
          أطلب توا
        </button>
      </div>
    </div>
  );
}

export default App;
