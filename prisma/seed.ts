/**
 * LA2TA seed — طيبة (Store #1) + 3 demo stores to prove the
 * generic Store→Offers / Category→Offers architecture (PRD §13, §33).
 *
 * Run: bun prisma/seed.ts
 */
import { PrismaClient } from '@prisma/client'

const db = new PrismaClient()

const DAY = 86_400_000
const now = Date.now()
const daysAgo = (d: number) => new Date(now - d * DAY)
const daysAhead = (d: number) => new Date(now + d * DAY)

async function main() {
  console.log('🌱 Seeding LA2TA…')

  // Clean slate
  await db.offer.deleteMany()
  await db.store.deleteMany()
  await db.category.deleteMany()

  /* ------------------------------ Categories ------------------------------ */
  const cats = await Promise.all(
    [
      { name: 'أزياء', slug: 'fashion', icon: '👗', sortOrder: 1 },
      { name: 'أحذية', slug: 'shoes', icon: '👟', sortOrder: 2 },
      { name: 'مطاعم وأكل', slug: 'food', icon: '🍕', sortOrder: 3 },
      { name: 'إلكترونيات', slug: 'electronics', icon: '📱', sortOrder: 4 },
      { name: 'أجهزة منزلية', slug: 'appliances', icon: '🧺', sortOrder: 5 },
      { name: 'منزل وأثاث', slug: 'home', icon: '🛋️', sortOrder: 6 },
      { name: 'تجميل وعناية', slug: 'beauty', icon: '💄', sortOrder: 7 },
      { name: 'سوبر ماركت', slug: 'supermarket', icon: '🛒', sortOrder: 8 },
      { name: 'خدمات', slug: 'services', icon: '🛠️', sortOrder: 9 },
      { name: 'أخرى', slug: 'other', icon: '📦', sortOrder: 10 },
    ].map((c) => db.category.create({ data: c }))
  )
  const catId = (slug: string) => cats.find((c) => c.slug === slug)!.id

  /* -------------------------------- Stores -------------------------------- */
  const taiba = await db.store.create({
    data: {
      name: 'طيبة للملابس الجاهزة',
      description:
        'محل ملابس رجالي وحريمي في قلب الأقصر — موديلات جديدة كل أسبوع وأسعار تناسب الجميع.',
      phone: '01001234567',
      whatsapp: '01001234567',
      address: 'شارع المحطة، أمام سينما الأقصر، الأقصر',
      latitude: 25.6992,
      longitude: 32.6443,
      isActive: true,
    },
  })

  const koshary = await db.store.create({
    data: {
      name: 'كشري أهل مصر',
      description: 'كشري مصري أصيل — صوص على أصوله وح態 يومي طازة.',
      phone: '01112223344',
      whatsapp: '01112223344',
      address: 'شارع السيل، بجانب كافيه النيل، الأقصر',
      latitude: 25.696,
      longitude: 32.642,
      isActive: true,
    },
  })

  const nileMobiles = await db.store.create({
    data: {
      name: 'موبايلات النيل',
      description: 'موبايلات واكسسوارات أصلية بضمان معتمد — تقسيط متاح.',
      phone: '01223334455',
      whatsapp: '01223334455',
      address: 'شارع المعبد، الأقصر',
      latitude: 25.6935,
      longitude: 32.6395,
      isActive: true,
    },
  })

  const wadiMarket = await db.store.create({
    data: {
      name: 'سوبرماركت الوادي',
      description: 'كل اللي بيتك محتاجه — عروض أسبوعية على المواد الغذائية.',
      phone: '01556667788',
      whatsapp: '01556667788',
      address: 'شارع المطار، أمام مدرسة الوادي، الأقصر',
      latitude: 25.68,
      longitude: 32.66,
      isActive: true,
    },
  })

  /* -------------------------------- Offers -------------------------------- */
  type SeedOffer = {
    storeId: number
    categoryId: number
    title: string
    description: string
    image: string
    oldPrice?: number
    newPrice?: number
    offerType?: string
    startAt: Date
    endAt: Date
    isFeatured?: boolean
    stats?: {
      impressions?: number
      views?: number
      mapClicks?: number
      callClicks?: number
      whatsappClicks?: number
      shares?: number
    }
  }

  const discount = (oldPrice: number, newPrice: number) =>
    Math.round((1 - newPrice / oldPrice) * 100)

  const offers: SeedOffer[] = [
    /* ---------------- طيبة للملابس الجاهزة (12 عرض) ---------------- */
    {
      storeId: taiba.id,
      categoryId: catId('fashion'),
      title: '3 شرابات بـ100 جنيه',
      description:
        'اختار أي 3 شرابات قطن من تشكيلة المحل — ألوان وموديلات متنوعة رجالي وحريمي.',
      image: '/uploads/seed/socks.png',
      oldPrice: 120,
      newPrice: 100,
      offerType: 'bundle',
      startAt: daysAgo(2),
      endAt: daysAhead(3),
      isFeatured: true,
      stats: { impressions: 1805, views: 214, mapClicks: 41, callClicks: 12, whatsappClicks: 67, shares: 23 },
    },
    {
      storeId: taiba.id,
      categoryId: catId('fashion'),
      title: 'طقم حريمي بـ280 بدل 400',
      description: 'طقم قطن حريمي موديل جديد — مقاسات من M إلى XXL وألوان متعددة.',
      image: '/uploads/seed/women-set.png',
      oldPrice: 400,
      newPrice: 280,
      startAt: daysAgo(1),
      endAt: daysAhead(5),
      isFeatured: true,
      stats: { impressions: 1320, views: 156, mapClicks: 33, callClicks: 9, whatsappClicks: 51, shares: 18 },
    },
    {
      storeId: taiba.id,
      categoryId: catId('fashion'),
      title: 'تيشيرت رجالي 100% قطن بـ99',
      description: 'تيشيرت قطن رجالي بألوان متعددة — مقاسات من M إلى 3XL.',
      image: '/uploads/seed/mens-tshirt.png',
      oldPrice: 150,
      newPrice: 99,
      startAt: daysAgo(3),
      endAt: daysAhead(8),
      stats: { impressions: 640, views: 61, mapClicks: 14, callClicks: 3, whatsappClicks: 18, shares: 6 },
    },
    {
      storeId: taiba.id,
      categoryId: catId('fashion'),
      title: 'برناطة حريمي شتوي بـ245',
      description: 'برناطة شتوية بفرو ناعم — ألوان بيج وأسود وبني كامل.',
      image: '/uploads/seed/winter-coat.png',
      oldPrice: 350,
      newPrice: 245,
      startAt: daysAgo(5),
      endAt: daysAhead(12),
      stats: { impressions: 520, views: 47, mapClicks: 11, whatsappClicks: 15, shares: 4 },
    },
    {
      storeId: taiba.id,
      categoryId: catId('fashion'),
      title: 'بنطلون جينز رجالي بـ165',
      description: 'جينز رجالي قماش تركي أصلي — مقاسات من 30 إلى 44.',
      image: '/uploads/seed/jeans.png',
      oldPrice: 220,
      newPrice: 165,
      startAt: daysAgo(2),
      endAt: daysAhead(6),
      stats: { impressions: 480, views: 44, mapClicks: 9, whatsappClicks: 12, shares: 3 },
    },
    {
      storeId: taiba.id,
      categoryId: catId('fashion'),
      title: 'فستان صيفي موديل جديد بـ336',
      description: 'فستان صيفي بنقشة ورود — خامة خفيفة ومريحة للموسم الجاي.',
      image: '/uploads/seed/summer-dress.png',
      oldPrice: 480,
      newPrice: 336,
      startAt: daysAgo(4),
      endAt: daysAhead(15),
      stats: { impressions: 410, views: 39, mapClicks: 8, whatsappClicks: 10, shares: 5 },
    },
    {
      storeId: taiba.id,
      categoryId: catId('fashion'),
      title: 'عباية كاجوال بـ450',
      description: 'عباية يومية بخامة كريب فاخر — قصات كاجوال أنيقة.',
      image: '/uploads/seed/abaya.png',
      oldPrice: 600,
      newPrice: 450,
      startAt: daysAgo(6),
      endAt: daysAhead(10),
      stats: { impressions: 360, views: 33, mapClicks: 7, whatsappClicks: 9, shares: 2 },
    },
    {
      storeId: taiba.id,
      categoryId: catId('fashion'),
      title: 'بيجامة قطن بـ135',
      description: 'بيجامة حريمي قطن 100% — ألوان باستيل هادية.',
      image: '/uploads/seed/pajamas.png',
      oldPrice: 180,
      newPrice: 135,
      startAt: daysAgo(1),
      endAt: daysAhead(4),
      stats: { impressions: 295, views: 28, mapClicks: 5, whatsappClicks: 8, shares: 3 },
    },
    {
      storeId: taiba.id,
      categoryId: catId('fashion'),
      title: 'شنطة يد نسائية بـ175',
      description: 'شنطة يد جلد شبيه بتصميم أنيق — تناسب كل المناسبات.',
      image: '/uploads/seed/handbag.png',
      oldPrice: 250,
      newPrice: 175,
      startAt: daysAgo(3),
      endAt: daysAhead(9),
      stats: { impressions: 310, views: 30, mapClicks: 6, whatsappClicks: 7, shares: 2 },
    },
    {
      storeId: taiba.id,
      categoryId: catId('fashion'),
      title: 'تريكو شتوي بـ196',
      description: 'بلوفر تريكو صوف ناعم — ألوان شتوية دافية.',
      image: '/uploads/seed/sweater.png',
      oldPrice: 280,
      newPrice: 196,
      startAt: daysAgo(7),
      endAt: daysAhead(20),
      stats: { impressions: 265, views: 24, mapClicks: 4, whatsappClicks: 6, shares: 1 },
    },
    {
      storeId: taiba.id,
      categoryId: catId('fashion'),
      title: 'بدلة رياضية رجالي بـ412',
      description: 'بدلة رياضية قماش مريح — تشكيلة كاملة بالمقاسات.',
      image: '/uploads/seed/tracksuit.png',
      oldPrice: 550,
      newPrice: 412,
      startAt: daysAgo(2),
      endAt: daysAhead(7),
      stats: { impressions: 240, views: 21, mapClicks: 4, whatsappClicks: 5, shares: 1 },
    },
    {
      storeId: taiba.id,
      categoryId: catId('fashion'),
      title: 'حزام جلد طبيعي بـ80',
      description: 'حزام رجالي جلد طبيعي بسوستة ستانلس — ضمان على السوستة.',
      image: '/uploads/seed/belt.png',
      oldPrice: 120,
      newPrice: 80,
      offerType: 'clearance',
      startAt: daysAgo(4),
      endAt: daysAhead(11),
      stats: { impressions: 190, views: 17, mapClicks: 3, whatsappClicks: 4, shares: 1 },
    },

    /* ---------------- كشري أهل مصر (2 عرض) ---------------- */
    {
      storeId: koshary.id,
      categoryId: catId('food'),
      title: 'وجبة كشري كبير بـ35 بدل 45',
      description: 'كشري كبير بكل الإضافات — اختار الصوص حار أو عادي.',
      image: '/uploads/seed/koshari.png',
      oldPrice: 45,
      newPrice: 35,
      startAt: daysAgo(1),
      endAt: daysAhead(2),
      isFeatured: true,
      stats: { impressions: 860, views: 98, mapClicks: 22, callClicks: 5, whatsappClicks: 30, shares: 12 },
    },
    {
      storeId: koshary.id,
      categoryId: catId('food'),
      title: 'كشري وسط + كركديه بـ45',
      description: 'طبق كشري وسط مع كوب كركديه مثلج — وجبة كاملة.',
      image: '/uploads/seed/koshari-meal.png',
      oldPrice: 60,
      newPrice: 45,
      offerType: 'bundle',
      startAt: daysAgo(1),
      endAt: daysAhead(4),
      stats: { impressions: 380, views: 36, mapClicks: 8, whatsappClicks: 11, shares: 4 },
    },

    /* ---------------- موبايلات النيل (2 عرض) ---------------- */
    {
      storeId: nileMobiles.id,
      categoryId: catId('electronics'),
      title: 'سماعة بلوتوث بـ279 بدل 350',
      description: 'سماعة لاسلكية Over-Ear — بطارية تدوم 20 ساعة وضمان سنة.',
      image: '/uploads/seed/headphones.png',
      oldPrice: 350,
      newPrice: 279,
      startAt: daysAgo(3),
      endAt: daysAhead(10),
      isFeatured: true,
      stats: { impressions: 740, views: 87, mapClicks: 19, callClicks: 7, whatsappClicks: 22, shares: 9 },
    },
    {
      storeId: nileMobiles.id,
      categoryId: catId('electronics'),
      title: 'باور بانك 20000 بـ399',
      description: 'شاحن محمول 20000 مللي أمبير — شحن سريع لجهازين في نفس الوقت.',
      image: '/uploads/seed/powerbank.png',
      oldPrice: 480,
      newPrice: 399,
      startAt: daysAgo(5),
      endAt: daysAhead(14),
      stats: { impressions: 350, views: 32, mapClicks: 6, callClicks: 2, whatsappClicks: 8, shares: 2 },
    },

    /* ---------------- سوبرماركت الوادي (2 عرض) ---------------- */
    {
      storeId: wadiMarket.id,
      categoryId: catId('supermarket'),
      title: 'زجاجتا زيت عباد الشمس بـ180',
      description: 'زجاجتان زيت عباد الشمس 1 لتر لكل زجاجة — عرض الأسبوع.',
      image: '/uploads/seed/cooking-oil.png',
      oldPrice: 210,
      newPrice: 180,
      offerType: 'bundle',
      startAt: daysAgo(2),
      endAt: daysAhead(5),
      stats: { impressions: 420, views: 40, mapClicks: 10, whatsappClicks: 9, shares: 5 },
    },
    {
      storeId: wadiMarket.id,
      categoryId: catId('supermarket'),
      title: '6 علب مناديل بـ75 بدل 90',
      description: 'كرتونة 6 علب مناديل ورقية — ماركات متنوعة حسب المتاح.',
      image: '/uploads/seed/tissues.png',
      oldPrice: 90,
      newPrice: 75,
      offerType: 'bundle',
      startAt: daysAgo(6),
      endAt: daysAhead(18),
      stats: { impressions: 300, views: 26, mapClicks: 5, whatsappClicks: 6, shares: 2 },
    },
  ]

  for (const o of offers) {
    await db.offer.create({
      data: {
        storeId: o.storeId,
        categoryId: o.categoryId,
        title: o.title,
        description: o.description,
        imageUrl: o.image,
        oldPrice: o.oldPrice ?? null,
        newPrice: o.newPrice ?? null,
        discountPercentage:
          o.oldPrice && o.newPrice ? discount(o.oldPrice, o.newPrice) : null,
        offerType: o.offerType ?? 'discount',
        startAt: o.startAt,
        endAt: o.endAt,
        isFeatured: o.isFeatured ?? false,
        status: 'ACTIVE',
        impressions: o.stats?.impressions ?? 0,
        views: o.stats?.views ?? 0,
        mapClicks: o.stats?.mapClicks ?? 0,
        callClicks: o.stats?.callClicks ?? 0,
        whatsappClicks: o.stats?.whatsappClicks ?? 0,
        shares: o.stats?.shares ?? 0,
      },
    })
  }

  console.log(
    `✅ Seeded: ${cats.length} categories, 4 stores (طيبة + 3 تجريبية), ${offers.length} offers`
  )
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => db.$disconnect())
