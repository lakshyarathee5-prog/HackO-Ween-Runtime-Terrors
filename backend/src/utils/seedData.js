require('dotenv').config();
const mongoose = require('mongoose');
const { connectDB, disconnectDB } = require('../config/database');
const User = require('../models/User');
const Organisation = require('../models/Organisation');
const FoodListing = require('../models/FoodListing');
const DemandRequest = require('../models/DemandRequest');
const Driver = require('../models/Driver');
const Delivery = require('../models/Delivery');
const Incident = require('../models/Incident');
const Forecast = require('../models/Forecast');
const AuditLog = require('../models/AuditLog');
const Notification = require('../models/Notification');

function getRelativeIso(hoursFromNow) {
  const d = new Date();
  d.setMinutes(d.getMinutes() + hoursFromNow * 60);
  return d;
}

const seedDatabase = async (options = { standalone: true }) => {
  if (options.standalone) {
    console.log('[Seed] Connecting to database...');
    await connectDB();
  }

  try {
    console.log('[Seed] Clearing existing collections...');
    await User.deleteMany({});
    await Organisation.deleteMany({});
    await FoodListing.deleteMany({});
    await DemandRequest.deleteMany({});
    await Driver.deleteMany({});
    await Delivery.deleteMany({});
    await Incident.deleteMany({});
    await Forecast.deleteMany({});
    await AuditLog.deleteMany({});
    await Notification.deleteMany({});

    console.log('[Seed] Seeding verified organisations...');
    const orgHostel = await Organisation.create({
      name: 'Aryabhatta University Hostel — Mess 2',
      type: 'hostel',
      category: 'provider',
      contactPerson: 'Dr. Rameshwar Meena',
      phone: '+91 98111 22334',
      email: 'mess2@aryabhatta.edu.in',
      address: 'Campus Sector 43, Mess 2 Logistics Bay, Gurugram',
      city: 'Gurugram',
      coordinates: [28.4595, 77.0988],
      verificationStatus: 'verified',
      description: 'Central campus mess serving 1,400 students daily with fresh dinner preparations.',
      capacityNotes: 'Up to 250 portions daily excess capacity',
      licenseId: 'FSSAI-10021064001290'
    });

    const orgHotel = await Organisation.create({
      name: 'Grand Amber Banquet & Suites',
      type: 'hotel',
      category: 'provider',
      contactPerson: 'Chef Kunal Kapoor',
      phone: '+91 98222 33445',
      email: 'banquets@grandamber.com',
      address: 'Sector 29, Leisure Valley Road, Gurugram',
      city: 'Gurugram',
      coordinates: [28.4682, 77.0631],
      verificationStatus: 'verified',
      description: 'Luxury hospitality partner donating unserved executive buffet courses.',
      capacityNotes: 'Cold chain storage available on-site',
      licenseId: 'FSSAI-10019064000431'
    });

    const orgBakery = await Organisation.create({
      name: 'The Artisan Crust & Oven',
      type: 'restaurant',
      category: 'provider',
      contactPerson: 'Neha Chawla',
      phone: '+91 98333 44556',
      email: 'orders@artisancrust.in',
      address: 'Shop 14, Galleria Market, DLF Phase 4, Gurugram',
      city: 'Gurugram',
      coordinates: [28.4667, 77.0864],
      verificationStatus: 'verified',
      description: 'Specialty bakery donating daily fresh artisanal loaves and rolls.',
      licenseId: 'FSSAI-10022064003310'
    });

    const orgAsha = await Organisation.create({
      name: 'Asha Community Shelter & Night Haven',
      type: 'shelter',
      category: 'recipient',
      contactPerson: 'Sister Teresa David',
      phone: '+91 98555 66778',
      email: 'shelter@ashacommunity.org',
      address: 'Behind Civil Lines, Sector 14, Gurugram',
      city: 'Gurugram',
      coordinates: [28.4721, 77.0428],
      verificationStatus: 'verified',
      description: 'Provides refuge and warm meals to 110 unhoused night shelter guests daily.',
      licenseId: '80G-DELHI-AAATA1234F'
    });

    const orgNavjyoti = await Organisation.create({
      name: 'Navjyoti Child Care & Learning Centre',
      type: 'ngo',
      category: 'recipient',
      contactPerson: 'Sunil Verma',
      phone: '+91 98666 77889',
      email: 'contact@navjyotichildcare.org',
      address: 'Near Govt School, Sector 10A, Gurugram',
      city: 'Gurugram',
      coordinates: [28.4485, 77.0142],
      verificationStatus: 'verified',
      description: 'Residential shelter and evening learning center supporting 65 children.',
      licenseId: '80G-DELHI-BBBTB5678G'
    });

    const orgSanjivani = await Organisation.create({
      name: 'Sanjivani Senior Citizen Food Support',
      type: 'community_kitchen',
      category: 'recipient',
      contactPerson: 'Dr. Pushpa Sen',
      phone: '+91 98777 88990',
      email: 'care@sanjivanifood.org',
      address: 'Community Centre, Sector 56, Gurugram',
      city: 'Gurugram',
      coordinates: [28.4239, 77.1042],
      verificationStatus: 'verified',
      description: 'Serves nutritious meals to elderly residents and hospice beneficiaries.',
      licenseId: '80G-DELHI-CCCTC9012H'
    });

    const orgFleet = await Organisation.create({
      name: 'Gurugram Green EV Logistics',
      type: 'logistics',
      category: 'logistics',
      contactPerson: 'Vikram Singh',
      phone: '+91 98808 90123',
      email: 'dispatch@greenevcouriers.in',
      address: 'Sector 32 Institutional Area, Gurugram',
      city: 'Gurugram',
      coordinates: [28.4552, 77.0519],
      verificationStatus: 'verified',
      description: 'Zero-emission electric delivery fleet with active cold-chain holding containers.',
      licenseId: 'LOG-HR-26-2023-EV09'
    });

    console.log('[Seed] Seeding authenticated stakeholder users...');
    const users = await User.create([
      {
        name: 'Ananya Deshmukh',
        email: 'ananya@foodresq.ai',
        passwordHash: 'DemoPassword123!',
        role: 'admin',
        organisationId: null,
        organisationName: 'FoodResQ Central Operations Hub',
        phone: '+91 98765 43210',
        city: 'Gurugram'
      },
      {
        name: 'Dr. Rameshwar Meena',
        email: 'mess2@aryabhatta.edu.in',
        passwordHash: 'DemoPassword123!',
        role: 'provider',
        organisationId: orgHostel._id,
        organisationName: orgHostel.name,
        phone: orgHostel.phone,
        city: 'Gurugram'
      },
      {
        name: 'Sister Teresa David',
        email: 'shelter@ashacommunity.org',
        passwordHash: 'DemoPassword123!',
        role: 'recipient',
        organisationId: orgAsha._id,
        organisationName: orgAsha.name,
        phone: orgAsha.phone,
        city: 'Gurugram'
      },
      {
        name: 'Rajesh Kumar',
        email: 'rajesh.kumar@greenev.in',
        passwordHash: 'DemoPassword123!',
        role: 'driver',
        organisationId: orgFleet._id,
        organisationName: orgFleet.name,
        phone: '+91 97111 55667',
        city: 'Gurugram'
      }
    ]);

    console.log('[Seed] Seeding EV fleet couriers...');
    const drivers = await Driver.create([
      {
        name: 'Rajesh Kumar',
        phone: '+91 97111 55667',
        email: 'rajesh.kumar@greenev.in',
        vehicleType: 'Electric Van',
        registrationNumber: 'HR-26-EV-409',
        capacityUnits: 80,
        currentCoordinates: [28.4621, 77.0851],
        batteryLevel: 78,
        status: 'in_transit',
        rating: 4.9
      },
      {
        name: 'Anita Sharma',
        phone: '+91 97222 66778',
        email: 'anita.sharma@greenev.in',
        vehicleType: 'Refrigerated Van',
        registrationNumber: 'HR-26-EV-812',
        capacityUnits: 120,
        currentCoordinates: [28.4699, 77.0552],
        batteryLevel: 92,
        status: 'available',
        rating: 4.95
      },
      {
        name: 'Vikas Verma',
        phone: '+91 97333 77889',
        email: 'vikas.verma@greenev.in',
        vehicleType: 'Cargo Auto',
        registrationNumber: 'HR-26-EV-302',
        capacityUnits: 50,
        currentCoordinates: [28.4512, 77.0255],
        batteryLevel: 65,
        status: 'available',
        rating: 4.82
      },
      {
        name: 'Mohit Rao',
        phone: '+91 97444 88990',
        email: 'mohit.rao@greenev.in',
        vehicleType: 'Electric Van',
        registrationNumber: 'HR-26-EV-554',
        capacityUnits: 90,
        currentCoordinates: [28.4355, 77.0912],
        batteryLevel: 84,
        status: 'available',
        rating: 4.88
      }
    ]);

    console.log('[Seed] Seeding surplus food listings...');
    const listingHostel = await FoodListing.create({
      title: 'Nutritious Steamed Rice, Dal Makhani & Seasonal Veg Mix',
      category: 'prepared_meals',
      providerId: orgHostel._id,
      providerName: orgHostel.name,
      quantity: 120,
      availableQuantity: 120,
      unit: 'portions',
      preparationTime: getRelativeIso(-1.5),
      safeUseDeadline: getRelativeIso(3.5),
      pickupLocation: {
        address: orgHostel.address,
        coordinates: orgHostel.coordinates
      },
      storageRequirements: 'Hot Held (>60°C) or Insulated Cambro Containers',
      allergenInfo: ['Dairy (Butter in Dal)', 'Gluten-Free Rice'],
      dietaryType: 'vegetarian',
      urgency: 'Urgent',
      status: 'available',
      notes: 'Hot freshly cooked dinner surplus batch. Clean stainless steel containers ready for transit.',
      createdBy: users[1]._id
    });

    const listingAmber = await FoodListing.create({
      title: 'Paneer Butter Masala, Jeera Pulao & Roti Assortment',
      category: 'prepared_meals',
      providerId: orgHotel._id,
      providerName: orgHotel.name,
      quantity: 60,
      availableQuantity: 20,
      unit: 'portions',
      preparationTime: getRelativeIso(-2),
      safeUseDeadline: getRelativeIso(4.5),
      pickupLocation: {
        address: orgHotel.address,
        coordinates: orgHotel.coordinates
      },
      storageRequirements: 'Insulated Hot Container (>60°C)',
      allergenInfo: ['Dairy', 'Wheat / Gluten'],
      dietaryType: 'vegetarian',
      urgency: 'Expiring Soon',
      status: 'partially_matched',
      notes: 'Unserved executive seminar buffet course packed in sanitary food-grade aluminium.',
      createdBy: users[0]._id
    });

    const listingBakery = await FoodListing.create({
      title: 'Whole Wheat Sourdough Loaves & Savoury Rolls',
      category: 'bakery',
      providerId: orgBakery._id,
      providerName: orgBakery.name,
      quantity: 45,
      availableQuantity: 45,
      unit: 'portions',
      preparationTime: getRelativeIso(-6),
      safeUseDeadline: getRelativeIso(18),
      pickupLocation: {
        address: orgBakery.address,
        coordinates: orgBakery.coordinates
      },
      storageRequirements: 'Room Temperature / Dry & Cool',
      allergenInfo: ['Gluten', 'Sesame'],
      dietaryType: 'vegetarian',
      urgency: 'Available',
      status: 'available',
      notes: 'Baked fresh today noon. Excellent shelf life for morning meals.',
      createdBy: users[0]._id
    });

    console.log('[Seed] Seeding recipient demands...');
    const demandAsha = await DemandRequest.create({
      recipientId: orgAsha._id,
      recipientName: orgAsha.name,
      category: 'prepared_meals',
      quantityRequested: 70,
      fulfilledQuantity: 0,
      unit: 'portions',
      urgency: 'critical',
      preferredDeliveryWindow: {
        start: getRelativeIso(0.5),
        end: getRelativeIso(2.5)
      },
      receivingCapacity: 100,
      location: {
        address: orgAsha.address,
        coordinates: orgAsha.coordinates
      },
      specialRequirements: ['Vegetarian preferred', 'Hot meal ready to serve'],
      status: 'pending',
      notes: 'Expected dinner crowd of 70-80 unhoused workers arriving by 21:00. Urgent demand.',
      createdBy: users[2]._id
    });

    const demandNavjyoti = await DemandRequest.create({
      recipientId: orgNavjyoti._id,
      recipientName: orgNavjyoti.name,
      category: 'prepared_meals',
      quantityRequested: 50,
      fulfilledQuantity: 0,
      unit: 'portions',
      urgency: 'high',
      preferredDeliveryWindow: {
        start: getRelativeIso(1),
        end: getRelativeIso(3)
      },
      receivingCapacity: 65,
      location: {
        address: orgNavjyoti.address,
        coordinates: orgNavjyoti.coordinates
      },
      specialRequirements: ['Child-friendly mild spices', 'Dairy acceptable'],
      status: 'pending',
      notes: 'Dinner for resident youth and evening tutorial pupils.',
      createdBy: users[0]._id
    });

    const demandSanjivani = await DemandRequest.create({
      recipientId: orgSanjivani._id,
      recipientName: orgSanjivani.name,
      category: 'prepared_meals',
      quantityRequested: 40,
      fulfilledQuantity: 40,
      unit: 'portions',
      urgency: 'medium',
      preferredDeliveryWindow: {
        start: getRelativeIso(1),
        end: getRelativeIso(4)
      },
      receivingCapacity: 50,
      location: {
        address: orgSanjivani.address,
        coordinates: orgSanjivani.coordinates
      },
      specialRequirements: ['Low sodium / salt', 'Soft texture'],
      status: 'fulfilled',
      notes: 'Senior citizen dining hall dinner serving.',
      createdBy: users[0]._id
    });

    console.log('[Seed] Seeding deliveries (active & verified)...');
    const deliveries = await Delivery.create([
      {
        trackingId: 'DEL-901',
        listingId: listingAmber._id,
        demandId: demandSanjivani._id,
        foodTitle: listingAmber.title,
        category: 'prepared_meals',
        providerId: orgHotel._id,
        providerName: orgHotel.name,
        recipientId: orgSanjivani._id,
        recipientName: orgSanjivani.name,
        driverId: drivers[0]._id,
        driverName: drivers[0].name,
        driverPhone: drivers[0].phone,
        vehicleType: drivers[0].vehicleType,
        quantity: 40,
        unit: 'portions',
        pickupLocation: orgHotel.address,
        destinationLocation: orgSanjivani.address,
        safeUseDeadline: getRelativeIso(4),
        status: 'in_transit',
        distanceKm: 6.8,
        etaMinutes: 18,
        timeline: [
          { timestamp: getRelativeIso(-1), status: 'assigned', description: 'Matched and assigned to Driver Rajesh Kumar' },
          { timestamp: getRelativeIso(-0.6), status: 'picked_up', description: 'Cargo verified at 64°C, insulated containers loaded' },
          { timestamp: getRelativeIso(-0.2), status: 'in_transit', description: 'En-route via Golf Course Extension' }
        ]
      },
      {
        trackingId: 'DEL-899',
        listingId: listingAmber._id,
        demandId: demandAsha._id,
        foodTitle: 'Executive Thali Meals (75 Portions)',
        category: 'prepared_meals',
        providerId: orgHotel._id,
        providerName: orgHotel.name,
        recipientId: orgAsha._id,
        recipientName: orgAsha.name,
        driverId: drivers[1]._id,
        driverName: drivers[1].name,
        driverPhone: drivers[1].phone,
        vehicleType: drivers[1].vehicleType,
        quantity: 75,
        unit: 'portions',
        pickupLocation: orgHotel.address,
        destinationLocation: orgAsha.address,
        safeUseDeadline: getRelativeIso(-1),
        status: 'delivered',
        completedAt: getRelativeIso(-2.8),
        distanceKm: 5.4,
        etaMinutes: 0,
        proofOfDelivery: {
          recipientSignatureName: 'Sister Teresa David',
          receivedPortions: 75,
          temperatureCelsius: 61.5,
          notes: 'Delivered in immaculate condition. Meals immediately distributed to shelter dining hall.',
          verifiedAt: getRelativeIso(-2.8)
        },
        timeline: [
          { timestamp: getRelativeIso(-4.5), status: 'assigned', description: 'Automated allocation created' },
          { timestamp: getRelativeIso(-3.8), status: 'picked_up', description: 'Collected from hotel logistics dock' },
          { timestamp: getRelativeIso(-2.8), status: 'delivered', description: 'Delivered & verified by Sister Teresa David' }
        ]
      }
    ]);

    console.log('[Seed] Seeding predictive surplus forecasts...');
    await Forecast.create([
      {
        facilityName: 'Aryabhatta University Hostel — Mess 2',
        category: 'College Hostel',
        dailyAverage: 110,
        projected7DayVolume: 770,
        peakWindow: 'Friday Dinner (20:30 - 22:00)',
        perishabilityRisk: 'Medium',
        recommendedMitigation: 'Auto-dispatch EV-409 with insulated hot boxes'
      },
      {
        facilityName: 'Grand Amber Banquet & Suites',
        category: 'Event Venue',
        dailyAverage: 260,
        projected7DayVolume: 1200,
        peakWindow: 'Saturday Night (22:30 - 01:00)',
        perishabilityRisk: 'High',
        recommendedMitigation: 'Pre-assign refrigerated van to Sanjivani Food Bank'
      },
      {
        facilityName: 'CyberHub Corporate Cafeteria',
        category: 'Corporate Food Court',
        dailyAverage: 65,
        projected7DayVolume: 320,
        peakWindow: 'Thursday Lunch (13:30 - 15:00)',
        perishabilityRisk: 'Low',
        recommendedMitigation: 'Direct batch transfer to Navjyoti Child Care'
      },
      {
        facilityName: 'The Artisan Crust & Oven',
        category: 'Bakery & Confectionery',
        dailyAverage: 35,
        projected7DayVolume: 160,
        peakWindow: 'Sunday Evening (20:00 - 21:30)',
        perishabilityRisk: 'Low',
        recommendedMitigation: 'Scheduled ambient courier pickup for Asha Shelter'
      }
    ]);

    console.log('[Seed] Seeding real-time notifications...');
    await Notification.create([
      {
        title: 'New Surplus Food Donation Available',
        message: 'Aryabhatta University Hostel listed 120 portions of Steamed Rice & Dal Makhani.',
        type: 'donation_match',
        targetRole: 'all',
        isRead: false,
        priority: 'high',
        actionUrl: 'matching.html',
        createdAt: getRelativeIso(-1.2)
      },
      {
        title: 'Delivery Dispatched — HR-26-EV-409',
        message: 'Driver Rajesh Kumar picked up 40kg fresh artisanal bread for Asha Shelter.',
        type: 'delivery_assigned',
        targetRole: 'admin',
        isRead: false,
        priority: 'normal',
        actionUrl: 'deliveries.html',
        createdAt: getRelativeIso(-0.5)
      },
      {
        title: 'Safe-Use Window Warning (< 3 hours)',
        message: 'Executive Thali Meals at Grand Amber Banquet requires prompt collection.',
        type: 'imminent_expiry',
        targetRole: 'provider',
        isRead: false,
        priority: 'urgent',
        actionUrl: 'food-listings.html',
        createdAt: getRelativeIso(-0.2)
      },
      {
        title: 'Proof-of-Delivery Confirmed',
        message: 'Sister Teresa David verified delivery of 75 meal portions at Asha Shelter.',
        type: 'status_change',
        targetRole: 'all',
        isRead: true,
        priority: 'normal',
        actionUrl: 'deliveries.html',
        createdAt: getRelativeIso(-2.8)
      }
    ]);

    console.log('[Seed] Seeding operational audit logs...');
    await AuditLog.create([
      {
        action: 'LISTING_CREATED',
        performedBy: { userId: users[1]._id, name: users[1].name, role: users[1].role },
        targetEntity: 'FoodListing',
        targetId: listingHostel._id.toString(),
        details: { quantity: 120, unit: 'portions', category: 'prepared_meals' },
        createdAt: getRelativeIso(-1.5)
      },
      {
        action: 'DEMAND_MATCHED',
        performedBy: { userId: users[0]._id, name: users[0].name, role: users[0].role },
        targetEntity: 'Delivery',
        targetId: 'DEL-409',
        details: { provider: orgBakery.name, recipient: orgAsha.name, portions: 40 },
        createdAt: getRelativeIso(-1)
      },
      {
        action: 'DELIVERY_COMPLETED',
        performedBy: { userId: users[3]._id, name: users[3].name, role: users[3].role },
        targetEntity: 'Delivery',
        targetId: 'DEL-899',
        details: { verifiedRecipient: 'Sister Teresa David', temperatureCelsius: 61.5 },
        createdAt: getRelativeIso(-2.8)
      }
    ]);

    console.log('[Seed] Seeding AI incident recovery events...');
    await Incident.create([
      {
        incidentId: 'INC-2026-001',
        deliveryId: deliveries[0]._id,
        trackingId: 'DEL-409',
        issueType: 'breakdown',
        description: 'Tire puncture on Golf Course Road during transfer of 40kg artisanal loaves.',
        originalPlan: {
          driverName: 'Rajesh Kumar',
          vehicleType: 'Electric Van',
          assignedPortions: 40,
          pickupLocation: orgBakery.address,
          dropoffLocation: orgAsha.address,
          originalEta: '18 mins'
        },
        revisedPlan: {
          reassignedDriverName: 'Anita Sharma',
          reassignedVehicle: 'Refrigerated Van (HR-26-EV-812)',
          interceptLocation: 'Sector 43 Intersection',
          revisedEta: '12 mins',
          salvagedPortions: 40,
          lostPortions: 0
        },
        salvageRatePercent: 100,
        replanLatencyMs: 640,
        status: 'resolved'
      }
    ]);

    console.log('✅ [Seed Complete] All collections seeded successfully with realistic Gurugram/NCR operational data.');
  } catch (err) {
    console.error('❌ [Seed Error] Failed to seed database:', err);
    if (!options.standalone) throw err;
  } finally {
    if (options.standalone) {
      await disconnectDB();
      process.exit(0);
    }
  }
};

if (require.main === module) {
  seedDatabase({ standalone: true });
}

module.exports = seedDatabase;
