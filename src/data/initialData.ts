import { Plant, CareAlert, CareLogEntry, SpeciesMatch, CareTask } from '../types';

export const INITIAL_PLANTS: Plant[] = [
  {
    id: 'monty',
    nickname: 'Monty',
    species: 'Monstera Deliciosa',
    scientificName: 'Deliciosa',
    location: 'Living room - north window',
    acquiredDate: '2026-06-10',
    healthScore: 85,
    survivalScore: 85,
    nextCareDue: 'Water in 3 days',
    nextCareDays: 3,
    waterRequirement: 'In 3 days',
    sunRequirement: 'Partial',
    status: 'Healthy',
    photoUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCCMwJCla7dJPo7MDWgljeol0WcOvXHwj3LivMJ8cbiQQ6TPb84beJDVny5KqWx7JXsN9DHaihU-xWOwNuzW0WjZhZKTEwuh6UtxI-Pk58xKFo8ARHi-4WonsYi91PQkyJSK54AG0L3MSAd3Aao5oqKF7R7KAvhn2QgfoAguQPnVF_1wd66-putB31NwYQPYoK2BffiTBuyl06q9HBEKtuFKzXEGfAhnOfj9QyEmfeEO4B5OeZ5Hg5pK4CvOj7wOEK9WByPo4Pk6ds',
    latitude: '37.7749',
    longitude: '-122.4194',
    watersCount: 12,
    fertsCount: 2,
    daysTracked: 45
  },
  {
    id: 'calathea-1',
    nickname: 'Calathea',
    species: 'Calathea Orbifolia',
    scientificName: 'Orbifolia',
    location: 'Bedroom - side table',
    acquiredDate: '2026-05-18',
    healthScore: 60,
    survivalScore: 60,
    nextCareDue: 'Water in 1 day',
    nextCareDays: 1,
    waterRequirement: 'In 1 day',
    sunRequirement: 'Shade',
    status: 'Thirsty',
    photoUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDYLivk5LRbEYKW55MvDTzLhn1FgCBXcz1b0XtYOmTfixn5ssDzMaaz2PC6Kyry3wsGlFR2BeUrHjzuZdJMNzYgdRpJ0AJr4SCNguVrXiBzbogEgK9LAC6JUEPGNOmGQ-z2neBmSw60lZlccl9Pd8d9GKpQ8KhjyMC8awaaZweMd9t_SkZvWzHBa8ZwVqQ7lkH9dUUIsNoE6oGxHtZL7-nngo_95U-M3TaRKMt3Nc2-NXTJZ91eWgtrBv5eMGIGN0lYMbAdtvC0Udc',
    watersCount: 8,
    fertsCount: 1,
    daysTracked: 66
  },
  {
    id: 'olive-1',
    nickname: 'Olive Tree',
    species: 'Olea europaea',
    scientificName: 'Olea europaea',
    location: 'Patio balcony',
    acquiredDate: '2026-04-12',
    healthScore: 95,
    survivalScore: 95,
    nextCareDue: 'Water in 6 days',
    nextCareDays: 6,
    waterRequirement: 'In 6 days',
    sunRequirement: 'Direct',
    status: 'Growing',
    photoUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBG5V2uyZuKp1JAb93dUnvs00RRZUiDyN7duenCEQA8jFl0Yf7pX5DHJEFa78oLGdfJbNmAjXXDVHf5LcvLxY-LrJIxl5TSsA79IELLkqplMbeFOjpfRRAT5WKVld4uqldmLZG2GPKNh2O24A_37D6U8KX-w5RuCOnaRACtinvIPR5-lGo_MEpw68BvXf2tDq_th9tBsyyrRL4jj8QTimyOiixpmyHj0SQJiKVjJRtBSiuLhzkIQjFm7JjWmKIf9mmvu_vMWQ0VhJ0',
    watersCount: 15,
    fertsCount: 3,
    daysTracked: 102
  },
  {
    id: 'fiddle-1',
    nickname: 'Fiddle Leaf Fig',
    species: 'Ficus lyrata',
    scientificName: 'Ficus lyrata',
    location: 'Study corner',
    acquiredDate: '2026-03-01',
    healthScore: 30,
    survivalScore: 30,
    nextCareDue: 'Overdue! (Watering)',
    nextCareDays: -2,
    waterRequirement: 'Overdue 2d',
    sunRequirement: 'Bright indirect',
    status: 'Warning',
    photoUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCzgYAXGY_KGvEb-JHnOsbKUVz_3sxzf4ho5h00Nqfid1k6iNw9nmneRmGHdfudPOs5AjnRYj4nTRWMvMTyZqyzK3_i1YunpDwYzLOnHQrUCp8wQKSNWfcQ_HJcj6-IMMTETl5WjOWyjIGK3xY4lljJdd5GYs6FHXMcU1IvApNGAVh6MvvO0AXs1MGm5qio-qIMiVnuOO7ZEmAWE2IFilMzMHxZDzfIxEpzXY8fnsAWEoCehiZscgAKiFR5pgjTOoLqpmuB-6_a4kM',
    watersCount: 10,
    fertsCount: 2,
    daysTracked: 144
  },
  {
    id: 'snake-1',
    nickname: 'Snake Plant',
    species: 'Sansevieria trifasciata',
    scientificName: 'Trifasciata',
    location: 'Hallway shelf',
    acquiredDate: '2026-01-15',
    healthScore: 78,
    survivalScore: 78,
    nextCareDue: 'Water in 4 days',
    nextCareDays: 4,
    waterRequirement: 'Low',
    sunRequirement: 'Low to Bright',
    status: 'Healthy',
    photoUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBtTo_luoL84RRaA6s_F1LFD5ulPaXLLjArqd0DpbTJGynFL5kWyuvtdd-uD6UvoOxS2sN9J-EnqaPiyLAOSh_CLdhdvXXc_ELrO5HqXUru1jU-MUnZwlVa3Ycya7JxGhpTOMO70-g2jdY3oLER22JXMGFBbQGv_S36oXjXms6R4UqQwOHUfmlddMO4wGop9ybCNbAxaKafLwRKhXnygwuoazRhI5p7IcrII4Hfd0V6ruc64iGd1cvYXPQbIpqhXs2XSfrnyDSjvN4',
    watersCount: 6,
    fertsCount: 1,
    daysTracked: 189
  },
  {
    id: 'spider-1',
    nickname: 'Spider Plant',
    species: 'Chlorophytum comosum',
    scientificName: 'Comosum',
    location: 'Kitchen window',
    acquiredDate: '2026-02-20',
    healthScore: 82,
    survivalScore: 82,
    nextCareDue: 'Water in 2 days',
    nextCareDays: 2,
    waterRequirement: 'Moderate',
    sunRequirement: 'Bright indirect',
    status: 'Stable',
    photoUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDTlnPdNG1Yao5UGDOlegCoA5TFh57rdabj48PRHhSa_UlObSZNImFt7Z5UuTk7437c_0wiJ6pXHT6DR8WMhmL78JtawYAKph4GLrLuvEDrHFha1hbs8G3BlxWVtlXBWmTmj6pAMaoJEZ7LaK0cE1KAi26ZUIcyCh15w2HBPtOxmIEoyBU_OQPFE3cQVkBOgKM4CDnwKspdKTnlOTEIqNQtzrTZmqv78nV9vq_wzimZS_7yBGVpQGh76_E2ppBXK1_U-F7Cvt6tefE',
    watersCount: 14,
    fertsCount: 2,
    daysTracked: 153
  }
];

export const INITIAL_CARE_ALERTS: CareAlert[] = [
  {
    id: 'alert-1',
    plantId: 'fiddle-1',
    plantName: 'Fiddle Leaf Fig',
    plantPhoto: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCzgYAXGY_KGvEb-JHnOsbKUVz_3sxzf4ho5h00Nqfid1k6iNw9nmneRmGHdfudPOs5AjnRYj4nTRWMvMTyZqyzK3_i1YunpDwYzLOnHQrUCp8wQKSNWfcQ_HJcj6-IMMTETl5WjOWyjIGK3xY4lljJdd5GYs6FHXMcU1IvApNGAVh6MvvO0AXs1MGm5qio-qIMiVnuOO7ZEmAWE2IFilMzMHxZDzfIxEpzXY8fnsAWEoCehiZscgAKiFR5pgjTOoLqpmuB-6_a4kM',
    alertType: 'water',
    title: 'Fiddle Leaf Fig',
    message: 'Overdue for watering (2 days)',
    severity: 'error',
    actionNeeded: 'Watering'
  },
  {
    id: 'alert-2',
    plantId: 'snake-1',
    plantName: 'Snake Plant',
    plantPhoto: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBtTo_luoL84RRaA6s_F1LFD5ulPaXLLjArqd0DpbTJGynFL5kWyuvtdd-uD6UvoOxS2sN9J-EnqaPiyLAOSh_CLdhdvXXc_ELrO5HqXUru1jU-MUnZwlVa3Ycya7JxGhpTOMO70-g2jdY3oLER22JXMGFBbQGv_S36oXjXms6R4UqQwOHUfmlddMO4wGop9ybCNbAxaKafLwRKhXnygwuoazRhI5p7IcrII4Hfd0V6ruc64iGd1cvYXPQbIpqhXs2XSfrnyDSjvN4',
    alertType: 'moisture',
    title: 'Snake Plant',
    message: 'Soil moisture at 8%',
    severity: 'error',
    actionNeeded: 'Moisture Check'
  },
  {
    id: 'alert-3',
    plantId: 'spider-1',
    plantName: 'Spider Plant',
    plantPhoto: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDTlnPdNG1Yao5UGDOlegCoA5TFh57rdabj48PRHhSa_UlObSZNImFt7Z5UuTk7437c_0wiJ6pXHT6DR8WMhmL78JtawYAKph4GLrLuvEDrHFha1hbs8G3BlxWVtlXBWmTmj6pAMaoJEZ7LaK0cE1KAi26ZUIcyCh15w2HBPtOxmIEoyBU_OQPFE3cQVkBOgKM4CDnwKspdKTnlOTEIqNQtzrTZmqv78nV9vq_wzimZS_7yBGVpQGh76_E2ppBXK1_U-F7Cvt6tefE',
    alertType: 'light',
    title: 'Spider Plant',
    message: 'Low light alert',
    severity: 'warning',
    actionNeeded: 'Move to brighter location'
  }
];

export const MONTY_CARE_LOGS: CareLogEntry[] = [
  {
    id: 'log-1',
    plantId: 'monty',
    type: 'Watered',
    title: 'Watered',
    timestamp: 'Yesterday, 10:30 AM',
    note: 'Given 500ml of filtered water. Soil was dry to the 2nd knuckle.',
    badgeText: 'Routine'
  },
  {
    id: 'log-2',
    plantId: 'monty',
    type: 'Milestone',
    title: 'New Leaf Milestone',
    timestamp: '3 days ago',
    note: 'A new fenestrated leaf has fully unfurled! Monty is thriving in this light.',
    badgeText: 'Milestone'
  },
  {
    id: 'log-3',
    plantId: 'monty',
    type: 'AI Note',
    title: 'AI Humidity Recommendation',
    timestamp: '4 days ago',
    note: '"The humidity is a bit low today (35%). I\'d recommend a light misting or turning on the humidifier for Monty."',
    badgeText: 'AI Suggestion'
  },
  {
    id: 'log-4',
    plantId: 'monty',
    type: 'Fertilized',
    title: 'Fertilized',
    timestamp: 'Last Tuesday',
    note: 'Applied 10-10-10 liquid fertilizer at half strength.',
    badgeText: 'Nutrition'
  }
];

export const INITIAL_SPECIES_DATABASE: SpeciesMatch[] = [
  {
    species: 'Monstera deliciosa',
    commonName: 'Swiss Cheese Plant',
    confidence: 98,
    tags: ['Tropical', 'Climbing'],
    photoUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC4pCGpENBOqU1X91S7MW4VB7gSBg9O1cwvp1kDMvWSmzZegP7t7vE9-34ru9fkMzdruWw-oSkWqwjyKe73nuOt6u080dG-EDI52k8b0pkeeAl2SFceoiXCFmSSknsWrWyWYe7WUivwiyKmGjHIwRZWH0UIYRXgZouw5K-vc-3AkOn_1rAi_BYjs_uRQEjFIvsaom3n2DEikfnPk4l4XCMCbfzt22fovIbhYXzP3D6BOuzS5s1d8ByAZuZQpRNx40kHL-g9fctPlEI',
    description: 'Popular tropical evergreen vine famous for perforated split leaves (fenestrations). Thrives in indirect light.',
    careInfo: { light: 'Partial / Indirect', water: 'Every 7-10 days', humidity: '50%+' }
  },
  {
    species: 'Philodendron gloriosum',
    commonName: 'Velvet-leaf Philodendron',
    confidence: 12,
    tags: ['Tropical', 'Crawling'],
    photoUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAPvb7MZWxgyywB8PvQUB1dFBso14wydynMvKHXFaVT4LnUYyrvQ4qNKXHtk0WRlbaHkS2_IzZLDrGV-Nfs0-gBg0pazJJsoSFhpqVgcsziC-ieyucxvt7S75sNxXQuljKb63QNXQF6Iv91xknsWtfCnxCpUtPb-OYZw1irzoRuhNmmWSFHhR8Jg4nTqK8UKczqTD-iVu50n8VRzw08FQNG5N3e9xDTJLNSE-nid0IwSYumHKg78uRmHdZhiiA2nTTE6D7UNNpcZHo',
    description: 'Terrestrial creeping philodendron with large, velvety heart-shaped leaves and pinkish-white margins.',
    careInfo: { light: 'Bright Indirect', water: 'Moderate', humidity: 'High' }
  },
  {
    species: 'Monstera adansonii',
    commonName: 'Five Holes Plant',
    confidence: 4,
    tags: ['Tropical', 'Trailing'],
    photoUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAyYByVA2YkV_SPUFSa13On83X4L7HPZZjRtNkjeqziOkhJn9Drbm8OiW4GW7UDMNsY7nJqsb5O3hP1TiTLqr-m_RTQ6KoqnrbJ7MFDKkgLwMiKpTXAd2VrDpMN90bHwX-GUovAkxdWtpZC5_0P3ct8nzyZ84oWipJtuKQH1JSIZy3RI2g7yS43gXhS47huwtnGBlXy7eyOYEY7gDLjZQgwplb6JF_atQN5d-TLAsGMbmyulR1u4rW4QEr-cH-czSm1TtX-tbhQOr8',
    description: 'Smaller relative of M. deliciosa featuring enclosed oval holes inside each leaf blade.',
    careInfo: { light: 'Medium Indirect', water: 'Weekly', humidity: '60%+' }
  }
];

export const INITIAL_CARE_TASKS: CareTask[] = [
  {
    id: 'task-1',
    plantId: 'fiddle-1',
    plantName: 'Fiddle Leaf Fig',
    taskType: 'Water',
    dueDate: '2026-07-21',
    dueLabel: 'Overdue (2 days)',
    isCompleted: false,
    overdue: true
  },
  {
    id: 'task-2',
    plantId: 'calathea-1',
    plantName: 'Calathea',
    taskType: 'Water',
    dueDate: '2026-07-24',
    dueLabel: 'Tomorrow',
    isCompleted: false,
    overdue: false
  },
  {
    id: 'task-3',
    plantId: 'monty',
    taskType: 'Mist',
    plantName: 'Monty',
    dueDate: '2026-07-23',
    dueLabel: 'Today',
    isCompleted: false,
    overdue: false
  },
  {
    id: 'task-4',
    plantId: 'monty',
    taskType: 'Water',
    plantName: 'Monty',
    dueDate: '2026-07-26',
    dueLabel: 'In 3 days',
    isCompleted: false,
    overdue: false
  },
  {
    id: 'task-5',
    plantId: 'snake-1',
    taskType: 'Inspect',
    plantName: 'Snake Plant',
    dueDate: '2026-07-27',
    dueLabel: 'In 4 days',
    isCompleted: false,
    overdue: false
  }
];
