import { KostStatus, KostType } from "@/modules/kost/kost.type";
import { PhotoCategory } from "@/modules/photo-kost/photo-kost.model";
import { PhotoRoomCategory } from "@/modules/photo-room/photo-room.model";

const kostData = [
  {
    name: "Kost Greenfence",
    description:
      "Kost nyaman dengan fasilitas lengkap di Tataaran Patar. Akses mudah, lingkungan aman, dan harga terjangkau. Cocok untuk mahasiswa dan pekerja.",
    type: KostType.CAMPUR,
    address: {
      province: "Sulawesi Utara",
      city: "Minahasa",
      district: "Tondano Selatan",
      detail: "Lorong Bengkel, Tataaran Patar",
      coordinates: { lat: 1.2834849296537876, lng: 124.87811254622736 },
    },
    facilities: [
      "Wifi",
      "Parkiran Motor",
      "Parkiran Mobil",
      "Dapur Bersama",
      "Jemuran",
      "Kamar Mandi Luar",
      "Penjaga Kost",
    ],
    rules: ["Akses 24 Jam", "Tamu bebas berkunjung", "Tamu boleh menginap"],
    isPublished: true,
    status: KostStatus.APPROVED,
    photos: [
      {
        category: PhotoCategory.STREET_VIEW,
        url: "https://res.cloudinary.com/dcq397jrp/image/upload/v1760056819/IMG-20251009-WA0111_xyjixs.jpg",
      },
      {
        category: PhotoCategory.FRONT_VIEW,
        url: "https://res.cloudinary.com/dcq397jrp/image/upload/v1760056819/IMG-20251009-WA0111_xyjixs.jpg",
      },
    ],

    roomTypes: [
      {
        name: "Kayu",
        size: "4 X 3",
        price: 300000,
        facilities: ["Bantal"],
        totalRooms: 8,
        occupiedRooms: 6,
        roomPhotos: [
          {
            category: PhotoRoomCategory.INSIDE_ROOM,
            url: "https://res.cloudinary.com/dcq397jrp/image/upload/v1760056826/IMG-20251009-WA0112_mwpvgf.jpg",
          },
          {
            category: PhotoRoomCategory.INSIDE_ROOM,
            url: "https://res.cloudinary.com/dcq397jrp/image/upload/v1760056830/IMG-20251009-WA0113_ekyx0s.jpg",
          },
          {
            category: PhotoRoomCategory.INSIDE_ROOM,
            url: "https://res.cloudinary.com/dcq397jrp/image/upload/v1760056833/IMG-20251009-WA0115_fayt7m.jpg",
          },
        ],
      },
    ],
  },
  {
    name: "Kost Mikha",
    description:
      "Kost strategis dengan fasilitas WiFi gratis, CCTV, dan ruang santai. Dilengkapi kamar mandi dalam dan dapur bersama. Lingkungan tenang dan aman di Tataaran Patar.",
    type: KostType.CAMPUR,
    address: {
      province: "Sulawesi Utara",
      city: "Minahasa",
      district: "Tondano Selatan",
      detail: "Lorong Bengkel, Tataaran Patar",
      coordinates: { lat: 1.2833675618375697, lng: 124.87825450321554 },
    },
    facilities: [
      "Wifi",
      "Parkiran Motor",
      "Dapur Bersama",
      "Kamar Mandi Luar",
      "Kompor",
      "CCTV",
      "Penjaga Kost",
      "Ruang Santai",
    ],
    rules: [
      "Akses 24 Jam",
      "Tamu bebas berkunjung",
      "Dilarang berisik",
      "Dilarang berisik setelah jam 10",
      "Dilarang membawa hewan",
      "Dilarang membawa minuman keras",
      "Dilarang membawa tamu menginap",
    ],
    isPublished: true,
    status: KostStatus.APPROVED,
    photos: [
      {
        category: PhotoCategory.STREET_VIEW,
        url: "https://res.cloudinary.com/dcq397jrp/image/upload/v1760025696/IMG-20251009-WA0083_x0bd9x.jpg",
      },
      {
        category: PhotoCategory.FRONT_VIEW,
        url: "https://res.cloudinary.com/dcq397jrp/image/upload/v1760025710/IMG-20251009-WA0100_pogyra.jpg",
      },
      {
        category: PhotoCategory.FRONT_VIEW,
        url: "https://res.cloudinary.com/dcq397jrp/image/upload/v1760025714/IMG-20251009-WA0101_nac7zs.jpg",
      },
      {
        category: PhotoCategory.ROOM_VIEW,
        url: "https://res.cloudinary.com/dcq397jrp/image/upload/v1760025707/IMG-20251009-WA0099_va1jxr.jpg",
      },
      {
        category: PhotoCategory.ROOM_VIEW,
        url: "https://res.cloudinary.com/dcq397jrp/image/upload/v1760025696/IMG-20251009-WA0086_f0zsmf.jpg",
      },
      {
        category: PhotoCategory.ROOM_VIEW,
        url: "https://res.cloudinary.com/dcq397jrp/image/upload/v1760025696/IMG-20251009-WA0091_nuszw4.jpg",
      },
    ],
    roomTypes: [
      {
        name: "Beton",
        size: "3 X 3",
        price: 350000,
        facilities: [
          "Kasur",
          "Kipas Angin",
          "Meja",
          "Kursi",
          "Lemari Baju",
          "Jendela",
          "K. Mandi Dalam",
          "Cermin",
        ],
        totalRooms: 5,
        occupiedRooms: 0,
        roomPhotos: [
          {
            category: PhotoRoomCategory.INSIDE_ROOM,
            url: "https://res.cloudinary.com/dcq397jrp/image/upload/v1760025726/IMG-20251009-WA0103_tfu2wp.jpg",
          },
        ],
      },
    ],
  },
  {
    name: "Kost Wale Ikoma",
    description:
      "Kost murah meriah dengan suasana nyaman di Tataaran Patar. Fasilitas WiFi gratis, dapur bersama, dan area parkir luas. Dekat dengan kampus dan pusat kota Tondano.",
    type: KostType.CAMPUR,
    address: {
      province: "Sulawesi Utara",
      city: "Minahasa",
      district: "Tondano Selatan",
      detail: "Lorong Bengkel, Tataaran Patar",
      coordinates: { lat: 1.2831132304951316, lng: 124.87841860476345 },
    },
    facilities: [
      "Wifi",
      "Parkiran Motor",
      "Dapur Bersama",
      "Jemuran",
      "Kamar Mandi Luar",
    ],
    rules: ["Akses 24 Jam", "Tamu bebas berkunjung", "Dilarang berisik"],
    isPublished: true,
    status: KostStatus.APPROVED,
    photos: [
      {
        category: PhotoCategory.STREET_VIEW,
        url: "https://res.cloudinary.com/dcq397jrp/image/upload/v1760027197/IMG-20251009-WA0079_dh78tc.jpg",
      },
      {
        category: PhotoCategory.FRONT_VIEW,
        url: "https://res.cloudinary.com/dcq397jrp/image/upload/v1760027193/IMG-20251009-WA0078_abejco.jpg",
      },
      {
        category: PhotoCategory.ROOM_VIEW,
        url: "https://res.cloudinary.com/dcq397jrp/image/upload/v1760027173/IMG-20251009-WA0053_h3lwa9.jpg",
      },
      {
        category: PhotoCategory.ROOM_VIEW,
        url: "https://res.cloudinary.com/dcq397jrp/image/upload/v1760027186/IMG-20251009-WA0074_ktc6gz.jpg",
      },
    ],
    roomTypes: [
      {
        name: "Tipe A",
        size: "3 X 3",
        price: 300000,
        facilities: [],
        totalRooms: 17,
        occupiedRooms: 0,
        roomPhotos: [
          {
            category: PhotoRoomCategory.INSIDE_ROOM,
            url: "https://res.cloudinary.com/dcq397jrp/image/upload/v1760027163/IMG-20251009-WA0046_cznnfi.jpg",
          },
          {
            category: PhotoRoomCategory.INSIDE_ROOM,
            url: "https://res.cloudinary.com/dcq397jrp/image/upload/v1760027184/IMG-20251009-WA0068_vkj5b6.jpg",
          },
        ],
      },
    ],
  },
  {
    name: "Kost Vanessa",
    description:
      "Kost bersih dan nyaman dengan ruang santai yang asri. Dilengkapi WiFi, dapur bersama, dan penjaga kost. Lokasi strategis di Tataaran 2, dekat dengan berbagai fasilitas umum.",
    type: KostType.CAMPUR,
    address: {
      province: "Sulawesi Utara",
      city: "Minahasa",
      district: "Tondano Selatan",
      detail: "Lorong Bengkel, Tataaran 2",
      coordinates: { lat: 1.2829981251665248, lng: 124.87803613802845 },
    },
    facilities: [
      "Wifi",
      "Parkiran Motor",
      "Dapur Bersama",
      "Jemuran",
      "Kamar Mandi Luar",
      "Penjaga Kost",
      "Ruang Santai",
    ],
    rules: [
      "Akses 24 Jam",
      "Tamu bebas berkunjung",
      "Dilarang berisik",
      "Dilarang membawa tamu menginap",
      "Dilarang membawa minuman keras",
    ],
    isPublished: true,
    status: KostStatus.APPROVED,
    photos: [
      {
        category: PhotoCategory.STREET_VIEW,
        url: "https://res.cloudinary.com/dcq397jrp/image/upload/v1760027785/IMG-20250923-WA0032_wz5avy.jpg",
      },
      {
        category: PhotoCategory.ROOM_VIEW,
        url: "https://res.cloudinary.com/dcq397jrp/image/upload/v1760027789/IMG-20251009-WA0017_qm4r7d.jpg",
      },
      {
        category: PhotoCategory.ROOM_VIEW,
        url: "https://res.cloudinary.com/dcq397jrp/image/upload/v1760027802/IMG-20251009-WA0022_jvonua.jpg",
      },
    ],
    roomTypes: [
      {
        name: "Tipe A",
        size: "3 X 3",
        price: 300000,
        facilities: [],
        totalRooms: 10,
        occupiedRooms: 0,
        roomPhotos: [
          {
            category: PhotoRoomCategory.INSIDE_ROOM,
            url: "https://res.cloudinary.com/dcq397jrp/image/upload/v1760027797/IMG-20251009-WA0021_ellotd.jpg",
          },
        ],
      },
    ],
  },
  {
    name: "Raphael Kost",
    description:
      "Kost modern dengan CCTV dan ruang keluarga. Tersedia pilihan kamar beton dan kayu dengan harga terjangkau. WiFi gratis, dapur lengkap, dan area parkir yang luas.",
    type: KostType.CAMPUR,
    address: {
      province: "Sulawesi Utara",
      city: "Minahasa",
      district: "Tondano Selatan",
      detail: "Lorong Bengkel, Tataaran 2",
      coordinates: { lat: 1.2845876797326172, lng: 124.88045290188707 },
    },
    facilities: [
      "Wifi",
      "Parkiran Motor",
      "Dapur Bersama",
      "Jemuran",
      "Kamar Mandi Luar",
      "CCTV",
      "Ruang Keluarga",
      "Ruang Santai",
    ],
    rules: [
      "Akses 24 Jam",
      "Tamu bebas berkunjung",
      "Dilarang berisik",
      "Dilarang membawa minuman keras",
    ],
    isPublished: true,
    status: KostStatus.APPROVED,
    photos: [
      {
        category: PhotoCategory.STREET_VIEW,
        url: "https://res.cloudinary.com/dcq397jrp/image/upload/v1760028731/Dari_Jalan_uh4psd.jpg",
      },
      {
        category: PhotoCategory.ROOM_VIEW,
        url: "https://res.cloudinary.com/dcq397jrp/image/upload/v1760028732/Lorong_gjravr.jpg",
      },
      {
        category: PhotoCategory.ROOM_VIEW,
        url: "https://res.cloudinary.com/dcq397jrp/image/upload/v1760028730/Dapur_wiwwy7.jpg",
      },
    ],
    roomTypes: [
      {
        name: "Beton",
        size: "3 X 3",
        price: 300000,
        facilities: [],
        totalRooms: 4,
        occupiedRooms: 0,
        roomPhotos: [
          {
            category: PhotoRoomCategory.INSIDE_ROOM,
            url: "https://res.cloudinary.com/dcq397jrp/image/upload/v1760028731/Kamar_Beton_lnwqcz.jpg",
          },
        ],
      },
      {
        name: "Kayu",
        size: "3 X 3",
        price: 300000,
        facilities: [],
        totalRooms: 4,
        occupiedRooms: 0,
        roomPhotos: [
          {
            category: PhotoRoomCategory.INSIDE_ROOM,
            url: "https://res.cloudinary.com/dcq397jrp/image/upload/v1760028731/Kamar_Kayu2_hzlggl.jpg",
          },
          {
            category: PhotoRoomCategory.INSIDE_ROOM,
            url: "https://res.cloudinary.com/dcq397jrp/image/upload/v1760028731/Kamar_Kayujpg_oycmwt.jpg",
          },
        ],
      },
    ],
  },
  {
    name: "Kost Ristavel",
    description:
      "Kost khusus putri dengan keamanan terjamin, dilengkapi CCTV dan ada jam malam. Fasilitas lengkap termasuk WiFi, kompor, dan dapur bersama. Lokasi tenang dan nyaman di Tataaran Patar.",
    type: KostType.PUTRI,
    address: {
      province: "Sulawesi Utara",
      city: "Minahasa",
      district: "Tondano Selatan",
      detail: "Lorong Bengkel, Tataaran Patar",
      coordinates: { lat: 1.2797434854989864, lng: 124.87832036956432 },
    },
    facilities: [
      "Wifi",
      "Parkiran Motor",
      "Dapur Bersama",
      "Jemuran",
      "Kamar Mandi Luar",
      "CCTV",
      "Kompor",
    ],
    rules: [
      "Ada jam malam",
      "Tamu bebas berkunjung",
      "Dilarang berisik",
      "Dilarang membawa minuman keras",
    ],
    isPublished: true,
    status: KostStatus.APPROVED,
    photos: [
      {
        category: PhotoCategory.STREET_VIEW,
        url: "https://res.cloudinary.com/dcq397jrp/image/upload/v1760029283/2025-04-15_mjm5fw.jpg",
      },
      {
        category: PhotoCategory.ROOM_VIEW,
        url: "https://res.cloudinary.com/dcq397jrp/image/upload/v1760029291/WhatsApp_Image_2025-09-29_at_10.11.29_02811862_cfgdia.jpg",
      },
    ],
    roomTypes: [
      {
        name: "Standart",
        size: "3 X 3",
        price: 450000,
        facilities: ["Meja", "Kursi", "Kasur", "Bantal"],
        totalRooms: 4,
        occupiedRooms: 0,
        roomPhotos: [
          {
            category: PhotoRoomCategory.INSIDE_ROOM,
            url: "https://res.cloudinary.com/dcq397jrp/image/upload/v1760029284/IMG-20250923-WA0013_s1dhui.jpg",
          },
          {
            category: PhotoRoomCategory.INSIDE_ROOM,
            url: "https://res.cloudinary.com/dcq397jrp/image/upload/v1760029285/IMG-20250923-WA0014_tagce0.jpg",
          },
        ],
      },
    ],
  },
  {
    name: "Elyon Kost",
    description:
      "Kost nyaman dengan kamar yang sudah dilengkapi furniture dasar. WiFi stabil, CCTV keamanan, dan ruang santai untuk bersantai. Lokasi strategis di Tataaran Patar.",
    type: KostType.CAMPUR,
    address: {
      province: "Sulawesi Utara",
      city: "Minahasa",
      district: "Tondano Selatan",
      detail: "Lorong Bengkel, Tataaran Patar",
      coordinates: { lat: 1.2847987158613212, lng: 124.8813335725116 },
    },
    facilities: [
      "Wifi",
      "Parkiran Motor",
      "Dapur Bersama",
      "Jemuran",
      "Kompor",
      "CCTV",
      "Ruang Santai",
    ],
    rules: [
      "Akses 24 Jam",
      "Tamu bebas berkunjung",
      "Dilarang berisik",
      "Dilarang membawa minuman keras",
    ],
    isPublished: true,
    status: KostStatus.APPROVED,
    photos: [
      {
        category: PhotoCategory.STREET_VIEW,
        url: "https://res.cloudinary.com/dcq397jrp/image/upload/v1760020344/IMG-20250930-WA0002_qmsbrc.jpg",
      },
      {
        category: PhotoCategory.FRONT_VIEW,
        url: "https://res.cloudinary.com/dcq397jrp/image/upload/v1760020349/IMG-20250930-WA0007_rrldcc.jpg",
      },
      {
        category: PhotoCategory.ROOM_VIEW,
        url: "https://res.cloudinary.com/dcq397jrp/image/upload/v1760020351/IMG-20250930-WA0009_wfenn9.jpg",
      },
      {
        category: PhotoCategory.ROOM_VIEW,
        url: "https://res.cloudinary.com/dcq397jrp/image/upload/v1760020364/IMG-20250930-WA0010_azgigp.jpg",
      },
    ],
    roomTypes: [
      {
        name: "Tipe A",
        size: "3 X 3",
        price: 300000,
        facilities: ["Kasur", "Meja", "Kursi", "Jendela"],
        totalRooms: 10,
        occupiedRooms: 0,
        roomPhotos: [
          {
            category: PhotoRoomCategory.INSIDE_ROOM,
            url: "https://res.cloudinary.com/dcq397jrp/image/upload/v1760020345/IMG-20250930-WA0004_jyjyge.jpg",
          },
          {
            category: PhotoRoomCategory.INSIDE_ROOM,
            url: "https://res.cloudinary.com/dcq397jrp/image/upload/v1760020345/IMG-20250930-WA0003_a8uawd.jpg",
          },
          {
            category: PhotoRoomCategory.INSIDE_ROOM,
            url: "https://res.cloudinary.com/dcq397jrp/image/upload/v1760020346/IMG-20250930-WA0005_dvgtfb.jpg",
          },
        ],
      },
    ],
  },
  {
    name: "-F-Kost",
    description:
      "Kost premium dengan kamar mandi dalam di setiap kamar. Fasilitas lengkap termasuk WiFi, CCTV, parkir mobil dan motor. Lokasi tenang di Renegetan Tondano dengan akses mudah.",
    type: KostType.CAMPUR,
    address: {
      province: "Sulawesi Utara",
      city: "Minahasa",
      district: "Tondano Barat",
      detail: "Renegetan, Tondano",
      coordinates: { lat: 1.2997311496978445, lng: 124.90544215541789 },
    },
    facilities: [
      "Wifi",
      "Parkiran Motor",
      "Parkiran Mobil",
      "Dapur Bersama",
      "Jemuran",
      "Kamar Mandi Luar",
      "CCTV",
      "Kompor",
    ],
    rules: [
      "Akses 24 Jam",
      "Tamu bebas berkunjung",
      "Dilarang membawa minuman keras",
    ],
    isPublished: true,
    status: KostStatus.APPROVED,
    photos: [
      {
        category: PhotoCategory.STREET_VIEW,
        url: "https://res.cloudinary.com/dcq397jrp/image/upload/v1760043086/IMG-20250923-WA0020_xmtzdv.jpg",
      },
      {
        category: PhotoCategory.ROOM_VIEW,
        url: "https://res.cloudinary.com/dcq397jrp/image/upload/v1760043086/IMG-20250923-WA0022_on7fhr.jpg",
      },
      {
        category: PhotoCategory.ROOM_VIEW,
        url: "https://res.cloudinary.com/dcq397jrp/image/upload/v1760043087/IMG-20250923-WA0023_vrz0bf.jpg",
      },
      {
        category: PhotoCategory.ROOM_VIEW,
        url: "https://res.cloudinary.com/dcq397jrp/image/upload/v1760043086/IMG-20250923-WA0019_kbink0.jpg",
      },
    ],
    roomTypes: [
      {
        name: "Tipe A",
        size: "3 X 3",
        price: 700000,
        facilities: ["K. Mandi Dalam"],
        totalRooms: 15,
        occupiedRooms: 0,
        roomPhotos: [
          {
            category: PhotoRoomCategory.INSIDE_ROOM,
            url: "https://res.cloudinary.com/dcq397jrp/image/upload/v1760043087/WhatsApp_Image_2025-09-23_at_20.26.20_690d936c_qb33ja.jpg",
          },
          {
            category: PhotoRoomCategory.BATH_ROOM,
            url: "https://res.cloudinary.com/dcq397jrp/image/upload/v1760043088/WhatsApp_Image_2025-09-23_at_20.26.20_a61773a5_njhmlv.jpg",
          },
        ],
      },
    ],
  },
  {
    name: "Kost God Bless",
    description:
      "Kost terjangkau dengan pilihan kamar papan dan beton. Parkir luas untuk mobil dan motor. WiFi gratis, dapur bersama, dan akses 24 jam. Dekat gerbang UNIMA.",
    type: KostType.CAMPUR,
    address: {
      province: "Sulawesi Utara",
      city: "Minahasa",
      district: "Tondano Selatan",
      detail: "Tataaran Patar, Tondano Selatan",
      coordinates: { lat: 1.2784910653209312, lng: 124.87862868895508 },
    },
    facilities: [
      "Wifi",
      "Parkiran Motor",
      "Parkiran Mobil",
      "Dapur Bersama",
      "Kamar Mandi Luar",
    ],
    rules: [
      "Akses 24 Jam",
      "Tamu bebas berkunjung",
      "Dilarang membawa minuman keras",
    ],
    isPublished: true,
    status: KostStatus.APPROVED,
    photos: [
      {
        category: PhotoCategory.STREET_VIEW,
        url: "https://res.cloudinary.com/dcq397jrp/image/upload/v1760053659/Screenshot_2025-10-10_074638_tmlkbc.png",
      },
      {
        category: PhotoCategory.FRONT_VIEW,
        url: "https://res.cloudinary.com/dcq397jrp/image/upload/v1760043632/WhatsApp_Image_2025-09-25_at_00.55.37_3a27fad8_oxofkw.jpg",
      },
    ],
    roomTypes: [
      {
        name: "Tipe Papan",
        size: "3 X 3",
        price: 250000,
        facilities: [],
        totalRooms: 5,
        occupiedRooms: 0,
        roomPhotos: [
          {
            category: PhotoRoomCategory.INSIDE_ROOM,
            url: "https://res.cloudinary.com/dcq397jrp/image/upload/v1760043620/IMG-20250925-WA0014_hnccbj.jpg",
          },
          {
            category: PhotoRoomCategory.INSIDE_ROOM,
            url: "https://res.cloudinary.com/dcq397jrp/image/upload/v1760043620/IMG-20250925-WA0014_hnccbj.jpg",
          },
        ],
      },
      {
        name: "Tipe Beton",
        size: "3 X 3",
        price: 350000,
        facilities: [],
        totalRooms: 5,
        occupiedRooms: 0,
        roomPhotos: [
          {
            category: PhotoRoomCategory.INSIDE_ROOM,
            url: "https://res.cloudinary.com/dcq397jrp/image/upload/v1760043622/IMG-20250925-WA0018_vrv4jj.jpg",
          },
        ],
      },
    ],
  },
  {
    name: "Kost Oma Ani",
    description:
      "Kost homey dengan ruang santai yang nyaman. Pilihan kamar biasa dan full furniture. WiFi tersedia, area jemuran luas. Suasana kekeluargaan di Tataaran 1.",
    type: KostType.CAMPUR,
    address: {
      province: "Sulawesi Utara",
      city: "Minahasa",
      district: "Tondano Selatan",
      detail: "Tataaran 1, Tondano Selatan",
      coordinates: { lat: 1.287038558891014, lng: 124.88250581289797 },
    },
    facilities: ["Wifi", "Parkiran Motor", "Jemuran", "Ruang Santai"],
    rules: ["Akses 24 Jam", "Tamu bebas berkunjung"],
    isPublished: true,
    status: KostStatus.APPROVED,
    photos: [
      {
        category: PhotoCategory.STREET_VIEW,
        url: "https://res.cloudinary.com/dcq397jrp/image/upload/v1760054265/IMG-20250925-WA0036_xouls4.jpg",
      },
      {
        category: PhotoCategory.FRONT_VIEW,
        url: "https://res.cloudinary.com/dcq397jrp/image/upload/v1760054272/IMG-20250925-WA0038_mqfjpm.jpg",
      },
      {
        category: PhotoCategory.ROOM_VIEW,
        url: "https://res.cloudinary.com/dcq397jrp/image/upload/v1760054276/IMG-20250925-WA0039_qmiqpu.jpg",
      },
    ],
    roomTypes: [
      {
        name: "Tipe Biasa",
        size: "3 X 3",
        price: 350000,
        facilities: [],
        totalRooms: 5,
        occupiedRooms: 0,
        roomPhotos: [
          {
            category: PhotoRoomCategory.INSIDE_ROOM,
            url: "https://res.cloudinary.com/dcq397jrp/image/upload/v1760054270/IMG-20250925-WA0037_lynj2n.jpg",
          },
        ],
      },
      {
        name: "Tipe Full",
        size: "3 X 3",
        price: 400000,
        facilities: ["Meja", "Kasur", "Bantal", "Kursi"],
        totalRooms: 8,
        occupiedRooms: 6,
        roomPhotos: [
          {
            category: PhotoRoomCategory.INSIDE_ROOM,
            url: "https://res.cloudinary.com/dcq397jrp/image/upload/v1760054264/IMG-20250925-WA0035_uthwhv.jpg",
          },
          {
            category: PhotoRoomCategory.INSIDE_ROOM,
            url: "https://res.cloudinary.com/dcq397jrp/image/upload/v1760054263/IMG-20250925-WA0034_og4nsz.jpg",
          },
        ],
      },
    ],
  },
  {
    name: "Kost Swedia",
    description:
      "Kost ekonomis dengan 2 pilihan tipe kamar. Area parkir motor tersedia, ruang santai outdoor. Lokasi tenang di Tataaran 1, cocok untuk mahasiswa dengan budget terbatas.",
    type: KostType.CAMPUR,
    address: {
      province: "Sulawesi Utara",
      city: "Minahasa",
      district: "Tondano Selatan",
      detail: "Tataaran 1, Tondano Selatan",
      coordinates: { lat: 1.2918247282031285, lng: 124.87553587976254 },
    },
    facilities: ["Parkiran Motor", "Jemuran", "Ruang Santai"],
    rules: ["Akses 24 Jam", "Tamu bebas berkunjung"],
    isPublished: true,
    status: KostStatus.APPROVED,
    photos: [
      {
        category: PhotoCategory.STREET_VIEW,
        url: "https://res.cloudinary.com/dcq397jrp/image/upload/v1760054750/IMG-20250925-WA0044_pbeery.jpg",
      },
      {
        category: PhotoCategory.FRONT_VIEW,
        url: "https://res.cloudinary.com/dcq397jrp/image/upload/v1760054748/IMG-20250925-WA0042_axgioz.jpg",
      },
      {
        category: PhotoCategory.ROOM_VIEW,
        url: "https://res.cloudinary.com/dcq397jrp/image/upload/v1760054759/IMG-20250925-WA0046_jnrphu.jpg",
      },
      {
        category: PhotoCategory.ROOM_VIEW,
        url: "https://res.cloudinary.com/dcq397jrp/image/upload/v1760054758/IMG-20250925-WA0045_bwmlr5.jpg",
      },
      {
        category: PhotoCategory.ROOM_VIEW,
        url: "https://res.cloudinary.com/dcq397jrp/image/upload/v1760054762/IMG-20250925-WA0047_rihkwh.jpg",
      },
      {
        category: PhotoCategory.ROOM_VIEW,
        url: "https://res.cloudinary.com/dcq397jrp/image/upload/v1760054773/IMG-20250925-WA0048_fi5hfa.jpg",
      },
    ],
    roomTypes: [
      {
        name: "Tipe A",
        size: "3 X 3",
        price: 250000,
        facilities: [],
        totalRooms: 5,
        occupiedRooms: 0,
        roomPhotos: [
          {
            category: PhotoRoomCategory.INSIDE_ROOM,
            url: "https://res.cloudinary.com/dcq397jrp/image/upload/v1760054784/IMG-20250925-WA0050_tsdj3e.jpg",
          },
        ],
      },
      {
        name: "Tipe B",
        size: "3 X 3",
        price: 350000,
        facilities: ["Meja", "Kursi"],
        totalRooms: 8,
        occupiedRooms: 6,
        roomPhotos: [
          {
            category: PhotoRoomCategory.INSIDE_ROOM,
            url: "https://res.cloudinary.com/dcq397jrp/image/upload/v1760054759/IMG-20250925-WA0046_jnrphu.jpg",
          },
        ],
      },
    ],
  },
  {
    name: "Rumah Kost Kembuan",
    description:
      "Kost premium dengan kamar mandi dalam di setiap kamar. Keamanan 24 jam dengan CCTV, WiFi kencang, dan parkir mobil tersedia. Lokasi di Kembuan dekat dengan kampus.",
    type: KostType.CAMPUR,
    address: {
      province: "Sulawesi Utara",
      city: "Minahasa",
      district: "Tondano Utara",
      detail: "Kembuan, Tondano Utara",
      coordinates: { lat: 1.3168057944372633, lng: 124.91784385465002 },
    },
    facilities: [
      "Wifi",
      "Dapur Bersama",
      "Parkiran Mobil",
      "CCTV",
      "Parkiran Motor",
    ],
    rules: [
      "Akses 24 Jam",
      "Tamu bebas berkunjung",
      "Dilarang membawa minuman keras",
      "Dilarang membawa tamu menginap",
    ],
    isPublished: true,
    status: KostStatus.APPROVED,
    photos: [
      {
        category: PhotoCategory.STREET_VIEW,
        url: "https://res.cloudinary.com/dcq397jrp/image/upload/v1760055262/IMG-20250925-WA0052_i0dqua.jpg",
      },
      {
        category: PhotoCategory.FRONT_VIEW,
        url: "https://res.cloudinary.com/dcq397jrp/image/upload/v1760055271/IMG-20250925-WA0055_boaq2a.jpg",
      },
    ],
    roomTypes: [
      {
        name: "Tipe A",
        size: "3 X 3",
        price: 600000,
        facilities: ["Meja", "Kursi", "Kasur", "Bantal", "K. Mandi Dalam"],
        totalRooms: 5,
        occupiedRooms: 0,
        roomPhotos: [
          {
            category: PhotoRoomCategory.INSIDE_ROOM,
            url: "https://res.cloudinary.com/dcq397jrp/image/upload/v1760055264/IMG-20250925-WA0053_qj6k2o.jpg",
          },
          {
            category: PhotoRoomCategory.BATH_ROOM,
            url: "https://res.cloudinary.com/dcq397jrp/image/upload/v1760055264/IMG-20250925-WA0053_qj6k2o.jpg",
          },
        ],
      },
    ],
  },
  {
    name: "Kost Juventus",
    description:
      "Kost strategis tepat di depan gerbang UNIMA. WiFi gratis, parkir mobil dan motor luas, dapur bersama. Tamu boleh menginap. Lokasi sangat ideal untuk mahasiswa UNIMA.",
    type: KostType.CAMPUR,
    address: {
      province: "Sulawesi Utara",
      city: "Minahasa",
      district: "Tondano Selatan",
      detail: "Depan gerbang unima, Tataran Patar, Tondano Selatan",
      coordinates: { lat: 1.2740043055797323, lng: 124.87598197364629 },
    },
    facilities: [
      "Wifi",
      "Dapur Bersama",
      "Parkiran Mobil",

      "Parkiran Motor",

      "Kamar Mandi Luar",
    ],
    rules: [
      "Akses 24 Jam",
      "Tamu bebas berkunjung",
      "Tamu boleh menginap",
      "Dilarang membawa minuman keras",
    ],
    isPublished: true,
    status: KostStatus.APPROVED,
    photos: [
      {
        category: PhotoCategory.STREET_VIEW,
        url: "https://res.cloudinary.com/dcq397jrp/image/upload/v1760055955/WhatsApp_Image_2025-09-29_at_23.43.32_b9633126_q0zeiq.jpg",
      },
      {
        category: PhotoCategory.FRONT_VIEW,
        url: "https://res.cloudinary.com/dcq397jrp/image/upload/v1760055962/WhatsApp_Image_2025-09-29_at_23.43.33_1cf932e5_uzzo9j.jpg",
      },
      {
        category: PhotoCategory.ROOM_VIEW,
        url: "https://res.cloudinary.com/dcq397jrp/image/upload/v1760055859/WhatsApp_Image_2025-09-29_at_23.41.29_73b61bcb_ccteqn.jpg",
      },
      {
        category: PhotoCategory.ROOM_VIEW,
        url: "https://res.cloudinary.com/dcq397jrp/image/upload/v1760055901/WhatsApp_Image_2025-09-29_at_23.43.31_fac85f0e_vyegcg.jpg",
      },
    ],
    roomTypes: [
      {
        name: "Tipe A",
        size: "3 X 3",
        price: 400000,
        facilities: ["Jendela", "Kamar Kosong"],
        totalRooms: 5,
        occupiedRooms: 0,
        roomPhotos: [
          {
            category: PhotoRoomCategory.INSIDE_ROOM,
            url: "https://res.cloudinary.com/dcq397jrp/image/upload/v1760055874/WhatsApp_Image_2025-09-29_at_23.42.01_b0d3d7c7_unbdcg.jpg",
          },
          {
            category: PhotoRoomCategory.INSIDE_ROOM,
            url: "https://res.cloudinary.com/dcq397jrp/image/upload/v1760055899/WhatsApp_Image_2025-09-29_at_23.43.31_c6449428_yzncvn.jpg",
          },
          {
            category: PhotoRoomCategory.INSIDE_ROOM,
            url: "https://res.cloudinary.com/dcq397jrp/image/upload/v1760055834/WhatsApp_Image_2025-09-29_at_23.41.29_57c1dfbe_e6xq5a.jpg",
          },
        ],
      },
    ],
  },
  {
    name: "Kost Binilang",
    description:
      "Kost di kompleks perumahan Maesa UNIMA yang aman dan nyaman. Tersedia pilihan kamar papan dan beton dengan harga bersahabat. WiFi dan dapur bersama tersedia.",
    type: KostType.CAMPUR,
    address: {
      province: "Sulawesi Utara",
      city: "Minahasa",
      district: "Tondano Selatan",
      detail:
        "(blok c no. 65) perum maesa unima, Tataaran Patar, Tondano Selatan",
      coordinates: { lat: 1.2651241930159982, lng: 124.87691951045149 },
    },
    facilities: ["Wifi", "Dapur Bersama", "Parkiran Motor", "Kamar Mandi Luar"],
    rules: [
      "Akses 24 Jam",
      "Tamu bebas berkunjung",
      "Dilarang membawa minuman keras",
    ],
    isPublished: true,
    status: KostStatus.APPROVED,
    photos: [
      {
        category: PhotoCategory.FRONT_VIEW,
        url: "https://res.cloudinary.com/dcq397jrp/image/upload/v1760056224/WhatsApp_Image_2025-09-29_at_23.45.54_65c51d1f_yovlca.jpg",
      },
      {
        category: PhotoCategory.ROOM_VIEW,
        url: "https://res.cloudinary.com/dcq397jrp/image/upload/v1760190625/kost_photos/dnz0km425jz3cnzsqmgs.jpg",
      },
    ],
    roomTypes: [
      {
        name: "Tipe Papan",
        size: "3 X 3",
        price: 300000,
        facilities: ["Jendela", "Kamar Kosong"],
        totalRooms: 5,
        occupiedRooms: 0,
        roomPhotos: [
          {
            category: PhotoRoomCategory.INSIDE_ROOM,
            url: "https://res.cloudinary.com/dcq397jrp/image/upload/v1760056226/WhatsApp_Image_2025-09-29_at_23.45.55_42aede37_k9tztn.jpg",
          },
          {
            category: PhotoRoomCategory.INSIDE_ROOM,
            url: "https://res.cloudinary.com/dcq397jrp/image/upload/v1760056217/WhatsApp_Image_2025-09-29_at_23.45.54_0d14d569_njc3cg.jpg",
          },
          {
            category: PhotoRoomCategory.INSIDE_ROOM,
            url: "https://res.cloudinary.com/dcq397jrp/image/upload/v1760056208/IMG-20250929-WA0042_lgh0dv.jpg",
          },
        ],
      },
      {
        name: "Tipe Beton",
        size: "3 X 3",
        price: 350000,
        facilities: ["Jendela", "Kamar Kosong"],
        totalRooms: 5,
        occupiedRooms: 0,
        roomPhotos: [
          {
            category: PhotoRoomCategory.INSIDE_ROOM,
            url: "https://res.cloudinary.com/dcq397jrp/image/upload/v1760056204/IMG-20250929-WA0041_gjb118.jpg",
          },
          {
            category: PhotoRoomCategory.INSIDE_ROOM,
            url: "https://res.cloudinary.com/dcq397jrp/image/upload/v1760056200/IMG-20250929-WA0040_z9rlfn.jpg",
          },
        ],
      },
    ],
  },
  {
    name: "Kost Kasih Karunia",
    description:
      "Kost modern dengan kamar mandi dalam dan kasur yang nyaman. Keamanan 24 jam dengan CCTV, WiFi stabil, dan dapur bersama. Lokasi strategis di dekat Pos LLAJ Tataaran Patar.",
    type: KostType.CAMPUR,
    address: {
      province: "Sulawesi Utara",
      city: "Minahasa",
      district: "Tondano Selatan",
      detail: "lorong Pos LLAJ, Tataaran Patar, Tondano Selatan",
      coordinates: { lat: 1.2651241930159982, lng: 124.87691951045149 },
    },
    facilities: [
      "Wifi",
      "Dapur Bersama",
      "Parkiran Motor",
      "CCTV",
      "Kamar Mandi Luar",
    ],
    rules: [
      "Akses 24 Jam",
      "Tamu bebas berkunjung",
      "Dilarang membawa minuman keras",
    ],
    isPublished: true,
    status: KostStatus.APPROVED,
    photos: [
      {
        category: PhotoCategory.FRONT_VIEW,
        url: "https://res.cloudinary.com/dcq397jrp/image/upload/v1760340666/IMG-20251013-WA0006_srldqh.jpg",
      },
      {
        category: PhotoCategory.ROOM_VIEW,
        url: "https://res.cloudinary.com/dcq397jrp/image/upload/v1760340670/IMG-20251013-WA0008_szpz9m.jpg",
      },
    ],
    roomTypes: [
      {
        name: "Tipe A",
        size: "3 X 3",
        price: 500000,
        facilities: ["K. Mandi Dalam", "Kasur"],
        totalRooms: 5,
        occupiedRooms: 0,
        roomPhotos: [
          {
            category: PhotoRoomCategory.INSIDE_ROOM,
            url: "https://res.cloudinary.com/dcq397jrp/image/upload/v1760340666/IMG-20251013-WA0004_n8rz1g.jpg",
          },
          {
            category: PhotoRoomCategory.INSIDE_ROOM,
            url: "https://res.cloudinary.com/dcq397jrp/image/upload/v1760340666/IMG-20251013-WA0005_h91ejr.jpg",
          },
          {
            category: PhotoRoomCategory.BATH_ROOM,
            url: "https://res.cloudinary.com/dcq397jrp/image/upload/v1760340666/IMG-20251013-WA0007_y9ybmd.jpg",
          },
        ],
      },
    ],
  },
];

export default kostData;
