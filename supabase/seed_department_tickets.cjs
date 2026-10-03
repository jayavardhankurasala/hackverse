const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const SEED_DATA = [
  // ==========================================
  // 1. IT SUPPORT
  // Staff: it.staff@svec.edu.in (Vikram Rao)
  // user_id: 05cc664a-f101-46d9-9faa-8f994a239220
  // dept_id: 7bf9e2dc-0b38-4e9e-bcb5-2c2d6b05efde
  // ==========================================
  {
    category: 'IT Support',
    staffUserId: '05cc664a-f101-46d9-9faa-8f994a239220',
    deptId: '7bf9e2dc-0b38-4e9e-bcb5-2c2d6b05efde',
    title: 'Wi-Fi router red light blinking in central library 2nd floor',
    description: 'The primary Cisco access point on the second floor reading room has a persistent blinking red indicator. Students are unable to connect to SVEC-STUDENT Wi-Fi during research hours.',
    priority: 'HIGH',
    status: 'IN_PROGRESS',
    location: 'Central Library, 2nd Floor Reading Hall',
    building: 'Library & Admin Block',
    room_number: 'LIB-201',
    aiSummary: 'Cisco AP hardware error causing localized Wi-Fi disconnectivity in reading room.',
  },
  {
    category: 'IT Support',
    staffUserId: '05cc664a-f101-46d9-9faa-8f994a239220',
    deptId: '7bf9e2dc-0b38-4e9e-bcb5-2c2d6b05efde',
    title: 'Server down: Student examination portal displaying 502 bad gateway',
    description: 'Internal exam submission server is unreachable from CSE Lab 3. The portal returns HTTP 502 bad gateway errors during mid-term laboratory evaluation.',
    priority: 'CRITICAL',
    status: 'ASSIGNED',
    location: 'CSE Academic Block, Ground Floor',
    building: 'CSE / IT Block',
    room_number: 'LAB-03',
    aiSummary: 'Internal evaluation portal server crash requiring daemon reboot and reverse proxy check.',
  },
  {
    category: 'IT Support',
    staffUserId: '05cc664a-f101-46d9-9faa-8f994a239220',
    deptId: '7bf9e2dc-0b38-4e9e-bcb5-2c2d6b05efde',
    title: 'Ceiling projector HDMI port damaged in Seminar Hall 1',
    description: 'The wall-mounted HDMI interface cable in Seminar Hall 1 has bent connector pins. Laptops fail to transmit audio and visual signal to the overhead projector.',
    priority: 'MEDIUM',
    status: 'ASSIGNED',
    location: 'Main Academic Block, 1st Floor',
    building: 'Academic Block (Main)',
    room_number: 'SEM-101',
    aiSummary: 'Damaged physical AV interface pins disrupting projection facilities.',
  },
  {
    category: 'IT Support',
    staffUserId: '05cc664a-f101-46d9-9faa-8f994a239220',
    deptId: '7bf9e2dc-0b38-4e9e-bcb5-2c2d6b05efde',
    title: 'Hostel Block A Room 204 Ethernet LAN port loose connection',
    description: 'The RJ45 wall jack in Room A-204 is loose and disconnects intermittently when the Ethernet cable moves. Please re-terminate the port jack.',
    priority: 'LOW',
    status: 'SUBMITTED',
    location: 'Hostel Block A, 2nd Floor',
    building: 'Hostel Block A',
    room_number: 'A-204',
    aiSummary: 'Loose wall faceplate Keystone jack requiring punchdown tool re-termination.',
  },

  // ==========================================
  // 2. ELECTRICAL
  // Staff: electrical.staff@svec.edu.in (Suresh Kumar)
  // user_id: 44015d09-af60-4949-931d-f8da6a82ad27
  // dept_id: 52b9246c-15a1-4107-b8b3-a379cf005331
  // ==========================================
  {
    category: 'Electrical',
    staffUserId: '44015d09-af60-4949-931d-f8da6a82ad27',
    deptId: '52b9246c-15a1-4107-b8b3-a379cf005331',
    title: 'AC short circuit and burning smell in 3rd floor CAD/CAM lab',
    description: 'Visible electric sparks and sharp acrid burning smell noticed from the 2-ton split AC switchboard in CAD/CAM Lab. The circuit breaker tripped immediately. Urgent inspection required before classes resume.',
    priority: 'CRITICAL',
    status: 'IN_PROGRESS',
    location: 'Mechanical Block, 3rd Floor',
    building: 'Mechanical & Civil Block',
    room_number: 'ME-302',
    aiSummary: 'Safety Override: Critical electrical arcing and insulation fire hazard detected in CAD lab.',
  },
  {
    category: 'Electrical',
    staffUserId: '44015d09-af60-4949-931d-f8da6a82ad27',
    deptId: '52b9246c-15a1-4107-b8b3-a379cf005331',
    title: 'Hostel Block B 1st floor corridor tube lights flickering constantly',
    description: 'Four LED tube fixtures in the east wing corridor of Hostel Block B are flickering rapidly and emitting a loud buzzing humming noise at night.',
    priority: 'MEDIUM',
    status: 'ASSIGNED',
    location: 'Hostel Block B, 1st Floor East Wing',
    building: 'Hostel Block B',
    room_number: 'Corridor B1',
    aiSummary: 'Failing LED driver ballasts generating acoustic noise and strobing.',
  },
  {
    category: 'Electrical',
    staffUserId: '44015d09-af60-4949-931d-f8da6a82ad27',
    deptId: '52b9246c-15a1-4107-b8b3-a379cf005331',
    title: 'Ceiling fan regulator burnt out and sparking in Room B-312',
    description: 'The rotary speed regulator switch sparked when turned to speed 3 and is now stuck in the off position. Switch plate is slightly scorched.',
    priority: 'HIGH',
    status: 'ASSIGNED',
    location: 'Hostel Block B, 3rd Floor',
    building: 'Hostel Block B',
    room_number: 'B-312',
    aiSummary: 'Resistor failure in rotary fan regulator presenting localized fire risk.',
  },
  {
    category: 'Electrical',
    staffUserId: '44015d09-af60-4949-931d-f8da6a82ad27',
    deptId: '52b9246c-15a1-4107-b8b3-a379cf005331',
    title: 'Classroom E-205 switchboard power outlet socket loose',
    description: 'The 3-pin 5A power socket used for teacher laptop charging at the podium has a loose internal spring clamp and requires re-fitting.',
    priority: 'LOW',
    status: 'SUBMITTED',
    location: 'ECE Block, 2nd Floor',
    building: 'ECE / EEE Block',
    room_number: 'E-205',
    aiSummary: 'Mechanical wear on 5A switchboard receptacle requiring replacement.',
  },

  // ==========================================
  // 3. PLUMBING
  // Staff: plumbing.staff@svec.edu.in (Ramesh Naidu)
  // user_id: 6f66e8f4-bd91-4bfb-b1e6-4c6db8cda110
  // dept_id: 302a444b-8cf1-44de-9be7-1f245455a180
  // ==========================================
  {
    category: 'Plumbing',
    staffUserId: '6f66e8f4-bd91-4bfb-b1e6-4c6db8cda110',
    deptId: '302a444b-8cf1-44de-9be7-1f245455a180',
    title: 'Hostel Block B 2nd floor main overhead water pipe burst and flooding',
    description: 'The PVC inlet pipe connected to the overhead water storage tank ruptured near the western stairway. Water is actively cascading down the stairs and flooding the hallway floor. Valve shutoff needed immediately.',
    priority: 'CRITICAL',
    status: 'IN_PROGRESS',
    location: 'Hostel Block B, 2nd Floor Staircase',
    building: 'Hostel Block B',
    room_number: 'Stairs-W',
    aiSummary: 'Safety Override: Severe water deluge from ruptured PVC riser pipe threatening electrical risers.',
  },
  {
    category: 'Plumbing',
    staffUserId: '6f66e8f4-bd91-4bfb-b1e6-4c6db8cda110',
    deptId: '302a444b-8cf1-44de-9be7-1f245455a180',
    title: 'Continuous water tap leakage and washbasin dripping in Room A-108',
    description: 'The chrome spindle tap in the bathroom attached to Room A-108 cannot be fully closed and drips constantly, wasting significant water.',
    priority: 'MEDIUM',
    status: 'ASSIGNED',
    location: 'Hostel Block A, Ground Floor',
    building: 'Hostel Block A',
    room_number: 'A-108',
    aiSummary: 'Worn washer in brass bibcock causing persistent freshwater loss.',
  },
  {
    category: 'Plumbing',
    staffUserId: '6f66e8f4-bd91-4bfb-b1e6-4c6db8cda110',
    deptId: '302a444b-8cf1-44de-9be7-1f245455a180',
    title: 'Severely blocked washbasin drain in Academic Block 1st floor washroom',
    description: 'Drainage pipe in the gents washroom near the staff room is completely clogged. Soap and dirty water are pooling and overflowing onto the counter.',
    priority: 'HIGH',
    status: 'ASSIGNED',
    location: 'Main Academic Block, 1st Floor East',
    building: 'Academic Block (Main)',
    room_number: 'WR-104',
    aiSummary: 'Solid debris blockage in P-trap pipe causing sanitary liquid backup.',
  },
  {
    category: 'Plumbing',
    staffUserId: '6f66e8f4-bd91-4bfb-b1e6-4c6db8cda110',
    deptId: '302a444b-8cf1-44de-9be7-1f245455a180',
    title: 'Drinking water RO cooler dispensing low pressure water near cafeteria',
    description: 'The push-button tap on the stainless steel water cooler outside the canteen dispenses only a trickle of water. Filter or intake pressure valve needs check.',
    priority: 'LOW',
    status: 'SUBMITTED',
    location: 'Central Canteen Pavilion',
    building: 'Canteen & Mess Hall',
    room_number: 'Water Station 2',
    aiSummary: 'Particulate sediment build-up in RO pre-filter restricting dispensing flow rate.',
  },

  // ==========================================
  // 4. MAINTENANCE
  // Staff: maintenance.staff@svec.edu.in (K. Prasad)
  // user_id: a490ca8f-dba4-43a9-a6d7-44e8fc174011
  // dept_id: bb0efb4b-65fb-415a-8f0f-65c3873d56fb
  // ==========================================
  {
    category: 'Maintenance',
    staffUserId: 'a490ca8f-dba4-43a9-a6d7-44e8fc174011',
    deptId: 'bb0efb4b-65fb-415a-8f0f-65c3873d56fb',
    title: 'Heavy wooden entrance door hinge cracked and sagging in Seminar Hall 2',
    description: 'The top steel hinge on the double fire door of Seminar Hall 2 is cracked. The door is sagging heavily, scraping against the tile floor, and risks falling off its frame.',
    priority: 'HIGH',
    status: 'IN_PROGRESS',
    location: 'Academic Block, Ground Floor',
    building: 'Academic Block (Main)',
    room_number: 'SEM-002',
    aiSummary: 'Structural hinge fatigue on egress fire door requiring heavy-duty replacement.',
  },
  {
    category: 'Maintenance',
    staffUserId: 'a490ca8f-dba4-43a9-a6d7-44e8fc174011',
    deptId: 'bb0efb4b-65fb-415a-8f0f-65c3873d56fb',
    title: 'Classroom M-104 window glass shattered during heavy rainstorm',
    description: 'A glass pane on the north-facing casement window in Classroom M-104 broke during strong wind gusts. Shards are on the window sill; needs glass replacement.',
    priority: 'HIGH',
    status: 'ASSIGNED',
    location: 'Mechanical Block, 1st Floor',
    building: 'Mechanical & Civil Block',
    room_number: 'M-104',
    aiSummary: 'Safety hazard: Shattered window glass glazing requiring immediate clearing and re-glazing.',
  },
  {
    category: 'Maintenance',
    staffUserId: 'a490ca8f-dba4-43a9-a6d7-44e8fc174011',
    deptId: 'bb0efb4b-65fb-415a-8f0f-65c3873d56fb',
    title: 'Wooden study desk bench broken in Lecture Hall C-301',
    description: 'The wooden plank of row 4 student bench is split along the grain and poses a splinter risk. Needs carpenter re-nailing and varnishing.',
    priority: 'MEDIUM',
    status: 'ASSIGNED',
    location: 'CSE Block, 3rd Floor',
    building: 'CSE / IT Block',
    room_number: 'C-301',
    aiSummary: 'Damaged wooden lecture furniture requiring joinery reinforcement.',
  },
  {
    category: 'Maintenance',
    staffUserId: 'a490ca8f-dba4-43a9-a6d7-44e8fc174011',
    deptId: 'bb0efb4b-65fb-415a-8f0f-65c3873d56fb',
    title: 'Notice board glass sliding lock jammed outside department office',
    description: 'The key is stuck inside the small cylinder lock of the wall notice board. We cannot post new semester circulars.',
    priority: 'LOW',
    status: 'SUBMITTED',
    location: 'Admin Building, 1st Floor Corridor',
    building: 'Library & Admin Block',
    room_number: 'NB-01',
    aiSummary: 'Key extraction and cylinder lubrication for corridor display vitrine.',
  },

  // ==========================================
  // 5. HOSTEL
  // Staff: hostel.staff@svec.edu.in (Anjali Devi)
  // user_id: 5e5036c6-ed0d-4096-a679-a0b134f5d470
  // dept_id: a8ba437f-77a6-4ef3-9ae3-0d97fde6fbfe
  // ==========================================
  {
    category: 'Hostel',
    staffUserId: '5e5036c6-ed0d-4096-a679-a0b134f5d470',
    deptId: 'a8ba437f-77a6-4ef3-9ae3-0d97fde6fbfe',
    title: 'Hostel Block A Room 314 door lock jammed with student locked inside',
    description: 'The mortise latch mechanism of Room A-314 seized suddenly. The handle turns freely without retracting the latch bolt. Student is unable to exit the room for class.',
    priority: 'CRITICAL',
    status: 'IN_PROGRESS',
    location: 'Hostel Block A, 3rd Floor',
    building: 'Hostel Block A',
    room_number: 'A-314',
    aiSummary: 'Safety Emergency: Student trapped in dorm room due to broken internal mortise spring mechanism.',
  },
  {
    category: 'Hostel',
    staffUserId: '5e5036c6-ed0d-4096-a679-a0b134f5d470',
    deptId: 'a8ba437f-77a6-4ef3-9ae3-0d97fde6fbfe',
    title: 'Hostel Block C Room 112 steel almirah locker hinge loose',
    description: 'The inner safe locker door inside the steel wardrobe in Room C-112 is loose and will not latch securely to protect student personal belongings.',
    priority: 'HIGH',
    status: 'ASSIGNED',
    location: 'Hostel Block C (Girls), 1st Floor',
    building: 'Hostel Block C (Girls)',
    room_number: 'C-112',
    aiSummary: 'Security concern regarding dorm room metal wardrobe lock clasp.',
  },
  {
    category: 'Hostel',
    staffUserId: '5e5036c6-ed0d-4096-a679-a0b134f5d470',
    deptId: 'a8ba437f-77a6-4ef3-9ae3-0d97fde6fbfe',
    title: 'Cot wooden slats displaced and sagging in Room B-206',
    description: 'Two wooden support slats beneath the mattress of bed #2 have slipped out of their metal frame brackets, causing the bed to sag unevenly.',
    priority: 'MEDIUM',
    status: 'ASSIGNED',
    location: 'Hostel Block B, 2nd Floor',
    building: 'Hostel Block B',
    room_number: 'B-206',
    aiSummary: 'Bed frame structural realignment needed for student residential comfort.',
  },
  {
    category: 'Hostel',
    staffUserId: '5e5036c6-ed0d-4096-a679-a0b134f5d470',
    deptId: 'a8ba437f-77a6-4ef3-9ae3-0d97fde6fbfe',
    title: 'Ceiling mosquito mesh screen torn on Room A-105 balcony window',
    description: 'The nylon mosquito net screen on the rear balcony sliding frame has a 6-inch tear allowing insects inside during evenings.',
    priority: 'LOW',
    status: 'SUBMITTED',
    location: 'Hostel Block A, 1st Floor',
    building: 'Hostel Block A',
    room_number: 'A-105',
    aiSummary: 'Window mesh patching required to prevent insect ingress in residential room.',
  },

  // ==========================================
  // 6. TRANSPORT
  // Staff: transport.staff@svec.edu.in (M. Venkat)
  // user_id: 0970ef5a-4e4c-4bef-a7d2-2711b279b4e8
  // dept_id: 5e85b851-d564-4d18-bc05-9a602477cca8
  // ==========================================
  {
    category: 'Transport',
    staffUserId: '0970ef5a-4e4c-4bef-a7d2-2711b279b4e8',
    deptId: '5e85b851-d564-4d18-bc05-9a602477cca8',
    title: 'Campus shuttle Bus #4 front left tire pressure low & worn tread',
    description: 'Bus #4 (Tadepalligudem Express Route) has noticeable pressure drop in front left tire and vibration above 40 km/h. Urgent pneumatic check and wheel alignment required before morning pickup.',
    priority: 'HIGH',
    status: 'IN_PROGRESS',
    location: 'Campus Bus Parking Bay 4',
    building: 'College Bus / Transport Fleet',
    room_number: 'Bus #04',
    aiSummary: 'Transit safety: Front steering tire pressure deficit and tread wear on key commuter route.',
  },
  {
    category: 'Transport',
    staffUserId: '0970ef5a-4e4c-4bef-a7d2-2711b279b4e8',
    deptId: '5e85b851-d564-4d18-bc05-9a602477cca8',
    title: 'College Bus #14 (Eluru Route) emergency exit door handle stuck',
    description: 'The rear emergency release door latch on Bus #14 is stiff and does not unlatch smoothly during mandatory morning safety inspection.',
    priority: 'CRITICAL',
    status: 'ASSIGNED',
    location: 'Vehicle Depot, Gate 3',
    building: 'College Bus / Transport Fleet',
    room_number: 'Bus #14',
    aiSummary: 'Safety Compliance: Vehicle emergency escape latch seizure violating fleet safety protocols.',
  },
  {
    category: 'Transport',
    staffUserId: '0970ef5a-4e4c-4bef-a7d2-2711b279b4e8',
    deptId: '5e85b851-d564-4d18-bc05-9a602477cca8',
    title: 'Bus #18 (Tanuku Route) passenger seat 14 backrest recliner broken',
    description: 'The recliner locking mechanism of seat 14 is broken, causing the seat back to collapse backward during transit.',
    priority: 'MEDIUM',
    status: 'ASSIGNED',
    location: 'South Bus Terminal',
    building: 'College Bus / Transport Fleet',
    room_number: 'Bus #18',
    aiSummary: 'Mechanical latch failure on passenger seat cushion causing passenger discomfort.',
  },
  {
    category: 'Transport',
    staffUserId: '0970ef5a-4e4c-4bef-a7d2-2711b279b4e8',
    deptId: '5e85b851-d564-4d18-bc05-9a602477cca8',
    title: 'Request for updated evening bus departure schedule display board',
    description: 'The printed bus timing schedule board near the main college gate has faded due to sunlight. Need laminated replacement with revised exam departure timings.',
    priority: 'LOW',
    status: 'SUBMITTED',
    location: 'Main Security Gate 1',
    building: 'College Bus / Transport Fleet',
    room_number: 'Bus Terminal Shelter',
    aiSummary: 'Signage refresh for student bus terminal route timings.',
  },

  // ==========================================
  // 7. CLEANING
  // Staff: cleaning.staff@svec.edu.in (Lakshmi Bai)
  // user_id: e6df93ef-509d-4507-8b3b-8aa820ca4454
  // dept_id: 3cf78ab1-d347-4009-b384-70178b4c948b
  // ==========================================
  {
    category: 'Cleaning',
    staffUserId: 'e6df93ef-509d-4507-8b3b-8aa820ca4454',
    deptId: '3cf78ab1-d347-4009-b384-70178b4c948b',
    title: 'Hostel Block B 1st floor common washroom urgent sanitization',
    description: 'The common washroom near room B-110 has dirty standing water and overflowing waste bin. Requires immediate deep disinfection, floor scrubbing, and fragrance re-fill.',
    priority: 'HIGH',
    status: 'IN_PROGRESS',
    location: 'Hostel Block B, 1st Floor Washroom',
    building: 'Hostel Block B',
    room_number: 'WR-B1',
    aiSummary: 'High priority sanitation dispatch: standing water and bin clearance in residential wing.',
  },
  {
    category: 'Cleaning',
    staffUserId: 'e6df93ef-509d-4507-8b3b-8aa820ca4454',
    deptId: '3cf78ab1-d347-4009-b384-70178b4c948b',
    title: 'Chemical dye spill in Chemistry Lab 2 hallway entrance',
    description: 'A bottle of non-corrosive potassium indicator solution slipped and broke in the doorway of Chemistry Lab 2. Slippery floor requires mop and sawdust absorption.',
    priority: 'HIGH',
    status: 'ASSIGNED',
    location: 'Science & Humanities Block, 2nd Floor',
    building: 'Academic Block (Main)',
    room_number: 'CHEM-202',
    aiSummary: 'Slip hazard: Laboratory chemical liquid spill in active pedestrian hallway.',
  },
  {
    category: 'Cleaning',
    staffUserId: 'e6df93ef-509d-4507-8b3b-8aa820ca4454',
    deptId: '3cf78ab1-d347-4009-b384-70178b4c948b',
    title: 'Garbage bin overflowing near Canteen north steps',
    description: 'The green compost bin near the outdoor canteen benches has reached capacity and requires clearing before lunch break.',
    priority: 'MEDIUM',
    status: 'ASSIGNED',
    location: 'Campus Canteen Garden Steps',
    building: 'Canteen & Mess Hall',
    room_number: 'Waste Point C',
    aiSummary: 'Routine canteen waste station clearance before peak meal period.',
  },
  {
    category: 'Cleaning',
    staffUserId: 'e6df93ef-509d-4507-8b3b-8aa820ca4454',
    deptId: '3cf78ab1-d347-4009-b384-70178b4c948b',
    title: 'Dust and spider cobwebs on high ceiling corners in Seminar Hall 1',
    description: 'High ceiling acoustic foam corners in Seminar Hall 1 have accumulated noticeable dust cobwebs before upcoming guest lecture.',
    priority: 'LOW',
    status: 'SUBMITTED',
    location: 'Main Academic Block, 1st Floor',
    building: 'Academic Block (Main)',
    room_number: 'SEM-101',
    aiSummary: 'High-reach dusting request for public auditorium ceiling recesses.',
  },

  // ==========================================
  // 8. ADMINISTRATION
  // Staff: admin.staff@svec.edu.in (G. Satyanarayana)
  // user_id: 75c4a99f-b46b-4f0c-a856-3814f5b16ed5
  // dept_id: 5c077125-0603-469b-a93d-538639045c2f
  // ==========================================
  {
    category: 'Administration',
    staffUserId: '75c4a99f-b46b-4f0c-a856-3814f5b16ed5',
    deptId: '5c077125-0603-469b-a93d-538639045c2f',
    title: 'Urgent Bonafide Certificate required for National Scholarship portal',
    description: 'Scholarship portal submission deadline is tomorrow at 5 PM. Need authorized principal sign and stamp on the study bonafide certificate for fee reimbursement verification.',
    priority: 'HIGH',
    status: 'IN_PROGRESS',
    location: 'Administrative Block, Ground Floor Counter 2',
    building: 'Library & Admin Block',
    room_number: 'ADM-02',
    aiSummary: 'Expedited bonafide documentation required for state scholarship compliance deadline.',
  },
  {
    category: 'Administration',
    staffUserId: '75c4a99f-b46b-4f0c-a856-3814f5b16ed5',
    deptId: '5c077125-0603-469b-a93d-538639045c2f',
    title: 'Replacement RFID campus identity card application (Lost ID)',
    description: 'Student lost physical ID card during campus bus transit. Requisite fee receipt paid online. Requesting re-printing and gate access authorization.',
    priority: 'MEDIUM',
    status: 'ASSIGNED',
    location: 'Admin Block, ID Card Section',
    building: 'Library & Admin Block',
    room_number: 'ADM-05',
    aiSummary: 'Duplicate smart identity card reissue and biometric security credential re-binding.',
  },
  {
    category: 'Administration',
    staffUserId: '75c4a99f-b46b-4f0c-a856-3814f5b16ed5',
    deptId: '5c077125-0603-469b-a93d-538639045c2f',
    title: 'Hostel bus pass concession stamp and signature renewal',
    description: 'Semester bus pass application submitted with hostel fee clearance receipt. Awaiting counter signature and official hologram sticker.',
    priority: 'MEDIUM',
    status: 'ASSIGNED',
    location: 'Admin Office, Transport Desk',
    building: 'Library & Admin Block',
    room_number: 'ADM-03',
    aiSummary: 'Student transit pass credential stamping and hostel residency authorization.',
  },
  {
    category: 'Administration',
    staffUserId: '75c4a99f-b46b-4f0c-a856-3814f5b16ed5',
    deptId: '5c077125-0603-469b-a93d-538639045c2f',
    title: 'Name spelling correction on provisional grade card transcript',
    description: 'Minor typographical spelling error on fathers name on 2nd-year semester 1 provisional grade memo. 10th marks memo copy attached for verification.',
    priority: 'LOW',
    status: 'SUBMITTED',
    location: 'Examination Branch, Counter 1',
    building: 'Library & Admin Block',
    room_number: 'EXAM-01',
    aiSummary: 'Academic registry clerical correction for father name in university database records.',
  },
];

async function seed() {
  console.log('🚀 Starting realistic ticket seeding for all 8 campus departments...\n');

  // 1. Fetch student profiles to use as ticket creators
  const { data: students, error: studentErr } = await supabase
    .from('profiles')
    .select('user_id, full_name')
    .eq('role', 'STUDENT');

  if (studentErr || !students || students.length === 0) {
    console.error('Failed to load student profiles:', studentErr);
    process.exit(1);
  }

  console.log(`Found ${students.length} student accounts to rotate as creators.`);

  // Sequential ticket index base
  const now = new Date();
  const day = String(now.getDate()).padStart(2, '0');
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const year = String(now.getFullYear());
  const datePrefix = `${day}${month}${year}`;

  let ticketIndex = 100;
  let insertedCount = 0;

  for (const item of SEED_DATA) {
    ticketIndex++;
    const ticketNumber = `${datePrefix}-${ticketIndex}`;
    const student = students[ticketIndex % students.length];

    // For ASSIGNED or IN_PROGRESS, assign to dedicated technician. For SUBMITTED, keep assigned_to null.
    const isAssigned = item.status === 'ASSIGNED' || item.status === 'IN_PROGRESS';
    const assignedTo = isAssigned ? item.staffUserId : null;
    const assignedAt = isAssigned ? new Date().toISOString() : null;

    const payload = {
      ticket_number: ticketNumber,
      title: item.title,
      description: item.description,
      category: item.category,
      department_id: item.deptId,
      priority: item.priority,
      status: item.status,
      location: item.location,
      building: item.building,
      room_number: item.room_number,
      created_by: student.user_id,
      assigned_to: assignedTo,
      assigned_at: assignedAt,
      ai_category: item.category,
      ai_priority: item.priority,
      ai_department: item.deptId,
      ai_summary: item.aiSummary,
    };

    const { data: inserted, error: insertErr } = await supabase
      .from('service_requests')
      .insert([payload])
      .select()
      .single();

    if (insertErr) {
      console.error(`❌ Error inserting ticket ${ticketNumber}:`, insertErr.message);
    } else {
      insertedCount++;
      console.log(`✅ [${item.category}] [${item.priority}] ${ticketNumber}: "${item.title.substring(0, 45)}..." -> Status: ${item.status}, AssignedTo: ${assignedTo ? 'Technician' : 'Queue'}`);

      // Insert corresponding activity logs
      const logs = [
        {
          request_id: inserted.id,
          user_id: student.user_id,
          action: `Request created by student ${student.full_name}`,
        },
      ];

      if (isAssigned) {
        logs.push({
          request_id: inserted.id,
          user_id: item.staffUserId,
          action: `AI Auto-Assignment: Dispatched to domain specialist (${item.category}) based on active workload`,
        });
      }

      if (item.status === 'IN_PROGRESS') {
        logs.push({
          request_id: inserted.id,
          user_id: item.staffUserId,
          action: `Technician started active diagnostic & repair work on site`,
        });
      }

      await supabase.from('activity_logs').insert(logs);
    }
  }

  console.log(`\n🎉 Successfully seeded ${insertedCount} realistic tickets across all 8 departments!`);
}

seed();
