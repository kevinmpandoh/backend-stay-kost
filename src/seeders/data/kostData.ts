import mongoose from "mongoose";

const kostsData = [
  // {
  //   name: "Kost Bahagia Manado",
  //   address: {
  //     province: "Sulawesi Utara",
  //     city: "Manado",
  //     district: "Sario",
  //     coordinates: { lat: 1.4706, lng: 124.8417 },
  //     detail: "Jl. Bethesda No.12",
  //   },
  //   description:
  //     "Kost nyaman dan bersih yang terletak di pusat kota Manado. Dekat dengan pusat perbelanjaan, rumah sakit, dan kampus ternama. Cocok untuk mahasiswa dan karyawan.",
  //   owner: new mongoose.Types.ObjectId(),
  //   type: "campur",
  // },
  // {
  //   name: "Kost putri Mawar Tomohon",
  //   alamat: {
  //     province: "Sulawesi Utara",
  //     city: "Tomohon",
  //     district: "Tomohon Tengah",
  //     coordinates: { lat: 1.3365, lng: 124.8421 },
  //     detail: "Jl. Mahoni No.8",
  //   },
  //   description:
  //     "Kost khusus putri yang menawarkan keamanan dan kenyamanan maksimal. Lingkungan tenang dan asri, ideal untuk belajar dan istirahat.",
  //   owner: new mongoose.Types.ObjectId(),
  //   type: "putri",
  // },
  // {
  //   name: "Kost Ceria Tondano",
  //   alamat: {
  //     province: "Sulawesi Utara",
  //     city: "Minahasa",
  //     district: "Tondano Barat",
  //     coordinates: { lat: 1.3005, lng: 124.9102 },
  //     detail: "Jl. Danau Tondano No.21",
  //   },
  //   description:
  //     "Kost strategis di pinggir Danau Tondano dengan pemandangan yang indah. Fasilitas lengkap, akses mudah ke kampus dan warung makan.",
  //   owner: new mongoose.Types.ObjectId(),
  //   type: "putra",
  // },
  // {
  //   name: "Kost Harmoni Bitung",
  //   alamat: {
  //     province: "Sulawesi Utara",
  //     city: "Bitung",
  //     district: "Maesa",
  //     coordinates: { lat: 1.4478, lng: 125.1965 },
  //     detail: "Jl. Sam Ratulangi No.19",
  //   },
  //   description:
  //     "Kost baru dengan bangunan modern dan fasilitas lengkap. Lokasi dekat pelabuhan dan kawasan industri Bitung. Cocok untuk pekerja dan mahasiswa.",
  //   owner: new mongoose.Types.ObjectId(),
  //   type: "campur",
  // },
  // {
  //   name: "Kost Asri Airmadidi",
  //   alamat: {
  //     province: "Sulawesi Utara",
  //     city: "Airmadidi",
  //     district: "Airmadidi",
  //     coordinates: { lat: 1.4641, lng: 124.9901 },
  //     detail: "Jl. Airmadidi Atas No.5",
  //   },
  //   description:
  //     "Kost tenang dan bersih dengan udara sejuk khas pegunungan Minahasa. Dilengkapi dapur bersama, ruang tamu, dan tempat parkir luas.",
  //   owner: new mongoose.Types.ObjectId(),
  //   type: "putri",
  // },
  // {
  //   name: "Kost Melati Indah",
  //   alamat: {
  //     province: "Sulawesi Utara",
  //     city: "Manado",
  //     district: "Tikala",
  //     coordinates: { lat: 1.4823, lng: 124.8523 },
  //     detail: "Jl. Tikala Ares No.10",
  //   },
  //   description:
  //     "Kost bersih dan aman dengan fasilitas lengkap. Dekat dengan kampus dan area kuliner. Lingkungan yang tenang dan nyaman untuk istirahat.",
  //   owner: new mongoose.Types.ObjectId(),
  //   type: "putri",
  // },
  // {
  //   name: "Kost Seruni Tomohon",
  //   alamat: {
  //     province: "Sulawesi Utara",
  //     city: "Tomohon",
  //     district: "Tomohon Selatan",
  //     coordinates: { lat: 1.3311, lng: 124.8299 },
  //     detail: "Jl. Raya Woloan No.7",
  //   },
  //   description:
  //     "Kost modern dengan suasana pegunungan yang sejuk. Fasilitas kamar mandi dalam, WiFi, dan ruang bersama yang nyaman.",
  //   owner: new mongoose.Types.ObjectId(),
  //   type: "campur",
  // },
  // {
  //   name: "Kost putra Sam Ratulangi",
  //   alamat: {
  //     province: "Sulawesi Utara",
  //     city: "Minahasa",
  //     district: "Tondano Timur",
  //     coordinates: { lat: 1.3033, lng: 124.9189 },
  //     detail: "Jl. Sam Ratulangi No.11",
  //   },
  //   description:
  //     "Kost dengan akses strategis ke berbagai kampus ternama di Tondano. Setiap kamar dilengkapi meja belajar dan lemari pakaian.",
  //   owner: new mongoose.Types.ObjectId(),
  //   type: "putra",
  // },
  {
    name: "Kost Bunga Sakura",
    address: {
      province: "Sulawesi Utara",
      city: "Manado",
      district: "Malalayang",
      coordinates: { lat: 1.4382, lng: 124.8235 },
      detail: "Jl. Sea Raya No.17",
    },
    description:
      "Kost elegan di kawasan Malalayang dengan akses langsung ke rumah sakit, universitas, dan pusat kuliner seafood. Tersedia kamar mandi dalam.",
    owner: new mongoose.Types.ObjectId(),
    type: "campur",
  },
  {
    name: "Kost Santai Bitung",
    address: {
      province: "Sulawesi Utara",
      city: "Bitung",
      district: "Lembeh Utara",
      coordinates: { lat: 1.4756, lng: 125.2201 },
      detail: "Jl. Lembeh No.5",
    },
    description:
      "Kost sederhana dan ekonomis dengan lingkungan yang ramah dan bersih. Tersedia kamar dengan ventilasi baik dan jendela besar.",
    owner: new mongoose.Types.ObjectId(),
    type: "putra",
  },
  {
    name: "Kost Puncak Kasih",
    address: {
      province: "Sulawesi Utara",
      city: "Tomohon",
      district: "Tomohon Utara",
      coordinates: { lat: 1.3456, lng: 124.8501 },
      detail: "Jl. Puncak No.3",
    },
    description:
      "Kost bergaya villa dengan pemandangan indah dari balkon kamar. Sangat cocok untuk mahasiswa yang mencari ketenangan.",
    owner: new mongoose.Types.ObjectId(),
    type: "putri",
  },
  {
    name: "Kost Amanah Manado",
    address: {
      province: "Sulawesi Utara",
      city: "Manado",
      district: "Wanea",
      coordinates: { lat: 1.4811, lng: 124.8294 },
      detail: "Jl. Rike No.21",
    },
    description:
      "Kost eksklusif dengan keamanan 24 jam dan lingkungan bebas asap rokok. Tersedia pantry dan area jemur pakaian di lantai atas.",
    owner: new mongoose.Types.ObjectId(),
    type: "campur",
  },
  {
    name: "Kost Tepi Danau",
    address: {
      province: "Sulawesi Utara",
      city: "Minahasa",
      district: "Tondano Selatan",
      coordinates: { lat: 1.2985, lng: 124.8993 },
      detail: "Jl. Boulevard Danau No.9",
    },
    description:
      "Kost indah dengan panorama danau yang menyejukkan. Cocok untuk kamu yang ingin jauh dari keramaian kota. Fasilitas lengkap dan nyaman.",
    owner: new mongoose.Types.ObjectId(),
    type: "campur",
  },
  {
    name: "Kost Flamboyan Bitung",
    address: {
      province: "Sulawesi Utara",
      city: "Bitung",
      district: "Girian",
      coordinates: { lat: 1.4532, lng: 125.1945 },
      detail: "Jl. Flamboyan No.8",
    },
    description:
      "Kost bergaya minimalis dengan konsep terbuka dan pencahayaan alami. Area bersih dan nyaman, cocok untuk karyawan maupun mahasiswa.",
    owner: new mongoose.Types.ObjectId(),
    type: "putra",
  },
  {
    name: "Kost Griya Sejuk",
    address: {
      province: "Sulawesi Utara",
      city: "Airmadidi",
      district: "Kalawat",
      coordinates: { lat: 1.4745, lng: 124.9787 },
      detail: "Jl. Kalawat Raya No.4",
    },
    description:
      "Kost dengan udara sejuk khas pegunungan dan pemandangan hijau. Tersedia WiFi, area parkir luas, dan taman kecil di halaman depan.",
    owner: new mongoose.Types.ObjectId(),
    type: "campur",
  },
  {
    name: "Kost Mawar Hills",
    address: {
      province: "Sulawesi Utara",
      city: "Tomohon",
      district: "Tomohon Tengah",
      coordinates: { lat: 1.3321, lng: 124.8347 },
      detail: "Jl. Mawar Hills No.12",
    },
    description:
      "Kost bergaya cottage di area perbukitan dengan udara segar dan suasana hening. Fasilitas dapur bersama dan kamar mandi dalam tersedia.",
    owner: new mongoose.Types.ObjectId(),
    type: "putri",
  },
  {
    name: "Kost Bahagia Airmadidi",
    address: {
      province: "Sulawesi Utara",
      city: "Airmadidi",
      district: "Airmadidi Atas",
      coordinates: { lat: 1.4784, lng: 124.9812 },
      detail: "Jl. Bahagia No.7",
    },
    description:
      "Kost modern dan bersih dengan akses dekat ke fasilitas umum. Setiap kamar dilengkapi tempat tidur ukuran queen dan jendela besar.",
    owner: new mongoose.Types.ObjectId(),
    type: "campur",
  },
  {
    name: "Kost Taman Asri",
    address: {
      province: "Sulawesi Utara",
      city: "Bitung",
      district: "Madidir",
      coordinates: { lat: 1.4545, lng: 125.1871 },
      detail: "Jl. Taman Asri No.9",
    },
    description:
      "Kost dengan taman depan yang luas dan udara yang segar. Suasana tenang cocok untuk mahasiswa maupun pekerja. Parkiran luas tersedia.",
    owner: new mongoose.Types.ObjectId(),
    type: "putra",
  },
  {
    name: "Kost Teratai Malalayang",
    address: {
      province: "Sulawesi Utara",
      city: "Manado",
      district: "Malalayang",
      coordinates: { lat: 1.4378, lng: 124.8244 },
      detail: "Jl. Teratai No.2",
    },
    description:
      "Kost dekat pantai dan rumah sakit besar di Malalayang. Lingkungan bersih dan aman dengan sistem keamanan 24 jam.",
    owner: new mongoose.Types.ObjectId(),
    type: "campur",
  },
  {
    name: "Kost Mentari Pagi",
    address: {
      province: "Sulawesi Utara",
      city: "Minahasa",
      district: "Tondano Barat",
      coordinates: { lat: 1.2999, lng: 124.9105 },
      detail: "Jl. Mentari No.14",
    },
    description:
      "Kost ideal untuk pelajar dengan harga terjangkau dan fasilitas dasar yang lengkap. Tersedia WiFi dan area belajar bersama.",
    owner: new mongoose.Types.ObjectId(),
    type: "putri",
  },
  {
    name: "Kost Hijau Daun",
    address: {
      province: "Sulawesi Utara",
      city: "Manado",
      district: "Sario",
      coordinates: { lat: 1.4789, lng: 124.8411 },
      detail: "Jl. Daun Hijau No.3",
    },
    description:
      "Kost strategis di pusat kota Manado, dekat pusat perbelanjaan dan transportasi. Fasilitas dapur dan ruang tamu bersama tersedia.",
    owner: new mongoose.Types.ObjectId(),
    type: "campur",
  },
  {
    name: "Kost Sinar Harapan",
    address: {
      province: "Sulawesi Utara",
      city: "Bitung",
      district: "Maesa",
      coordinates: { lat: 1.4499, lng: 125.1902 },
      detail: "Jl. Sinar Harapan No.6",
    },
    description:
      "Kost yang nyaman dan terjangkau, cocok untuk pekerja pelabuhan dan mahasiswa. Kamar mandi luar dengan fasilitas laundry bersama.",
    owner: new mongoose.Types.ObjectId(),
    type: "putra",
  },
  {
    name: "Kost Lavender Hill",
    address: {
      province: "Sulawesi Utara",
      city: "Tomohon",
      district: "Tomohon Timur",
      coordinates: { lat: 1.3367, lng: 124.8482 },
      detail: "Jl. Lavender No.11",
    },
    description:
      "Kost modern dengan desain elegan dan view pegunungan. Fasilitas lengkap, cocok untuk wanita profesional maupun mahasiswa.",
    owner: new mongoose.Types.ObjectId(),
    type: "putri",
  },
  {
    name: "Kost Damai Sejahtera",
    address: {
      province: "Sulawesi Utara",
      city: "Manado",
      district: "Paal Dua",
      coordinates: { lat: 1.4845, lng: 124.8555 },
      detail: "Jl. Damai No.8",
    },
    description:
      "Kost tenang dan aman dengan harga bersahabat. Tersedia kamar luas, kipas angin, serta kamar mandi dalam. Sangat cocok untuk mahasiswa rantau.",
    owner: new mongoose.Types.ObjectId(),
    type: "campur",
  },
  {
    name: "Kost Pelita Airmadidi",
    address: {
      province: "Sulawesi Utara",
      city: "Airmadidi",
      district: "Airmadidi Bawah",
      coordinates: { lat: 1.4757, lng: 124.9765 },
      detail: "Jl. Pelita No.5",
    },
    description:
      "Kost dekat pasar dan kampus Universitas Negeri Manado. Lokasi strategis dan akses mudah kemana saja. Area kost bersih dan terawat.",
    owner: new mongoose.Types.ObjectId(),
    type: "putra",
  },
  {
    name: "Kost Kenanga",
    address: {
      province: "Sulawesi Utara",
      city: "Manado",
      district: "Tikala",
      coordinates: { lat: 1.4815, lng: 124.8532 },
      detail: "Jl. Kenanga No.10",
    },
    description:
      "Kost dengan kamar ber-AC dan akses WiFi cepat. Suasana tenang dan nyaman, cocok untuk mahasiswa yang butuh konsentrasi belajar.",
    owner: new mongoose.Types.ObjectId(),
    type: "putri",
  },
  {
    name: "Kost Panorama Danau",
    address: {
      province: "Sulawesi Utara",
      city: "Minahasa",
      district: "Tondano Timur",
      coordinates: { lat: 1.3002, lng: 124.9201 },
      detail: "Jl. Danau Raya No.2",
    },
    description:
      "Kost dengan view langsung ke Danau Tondano. Suasana tenang dan udara segar. Tersedia kamar mandi dalam dan balkon pribadi.",
    owner: new mongoose.Types.ObjectId(),
    type: "campur",
  },
  {
    name: "Kost Simponi Kasih",
    address: {
      province: "Sulawesi Utara",
      city: "Tomohon",
      district: "Tomohon Barat",
      coordinates: { lat: 1.3372, lng: 124.8432 },
      detail: "Jl. Simponi No.6",
    },
    description:
      "Kost eksklusif untuk wanita dengan fasilitas lengkap. Dilengkapi ruang tamu bersama, dapur, dan taman belakang untuk bersantai.",
    owner: new mongoose.Types.ObjectId(),
    type: "putri",
  },
  {
    name: "Kost Harmoni Indah",
    address: {
      province: "Sulawesi Utara",
      city: "Minahasa",
      district: "Tondano Selatan",
      coordinates: { lat: 1.278347, lng: 124.87997 },
      detail: "Jl. Harmoni No.15",
    },
    description:
      "Kost eksklusif dengan pintu gerbang keamanan. Lingkungan tenang.",
    owner: new mongoose.Types.ObjectId(),
    type: "putra",
  },
  {
    name: "Kost Permata Tataaran",
    address: {
      province: "Sulawesi Utara",
      city: "Minahasa",
      district: "Tondano Selatan",
      coordinates: { lat: 1.275024, lng: 124.87487 },
      detail: "Jl. Permata No.2",
    },
    description:
      "Kost 2 lantai, cocok untuk mahasiswa dan mahasiswi. Parkir luas.",
    owner: new mongoose.Types.ObjectId(),
    type: "campur",
  },
  {
    name: "Kost Griya Unima",
    address: {
      province: "Sulawesi Utara",
      city: "Minahasa",
      district: "Tondano Barat",
      coordinates: { lat: 1.28901, lng: 124.8872 },
      detail: "Jl. Griya Unima No.6",
    },
    description:
      "Kost nyaman dan murah untuk mahasiswa. Ada meja belajar dan lemari.",
    owner: new mongoose.Types.ObjectId(),
    type: "putra",
  },
  {
    name: "Kost Berkat Anugerah",
    address: {
      province: "Sulawesi Utara",
      city: "Minahasa",
      district: "Tondano Selatan",
      coordinates: { lat: 1.26475, lng: 124.87651 },
      detail: "Jl. Anugerah No.12",
    },
    description:
      "Kost bersih dan aman. Banyak mahasiswa Unima tinggal di sekitar.",
    owner: new mongoose.Types.ObjectId(),
    type: "putri",
  },
  {
    name: "Kost Seruni",
    address: {
      province: "Sulawesi Utara",
      city: "Minahasa",
      district: "Tondano Barat",
      coordinates: { lat: 1.2881, lng: 124.8853 },
      detail: "Jl. Seruni No.2",
    },
    description: "Fasilitas lengkap dengan listrik prabayar dan dapur bersama.",
    owner: new mongoose.Types.ObjectId(),
    type: "campur",
  },
  {
    name: "Kost Glory Hills",
    address: {
      province: "Sulawesi Utara",
      city: "Minahasa",
      district: "Tondano Selatan",
      coordinates: { lat: 1.275249, lng: 124.87691 },
      detail: "Perumahan Glory Hills No.8",
    },
    description:
      "Kost premium 2 lantai untuk wanita, dekat halte angkot dan Unima.",
    owner: new mongoose.Types.ObjectId(),
    type: "putri",
  },
];

export default kostsData;
