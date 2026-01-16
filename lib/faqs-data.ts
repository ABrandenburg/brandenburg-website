// FAQ data parsed from Brandenburg Plumbing - FAQs (2).csv

export interface FAQ {
  id: string
  serviceType: string
  question: string
  answer: string
}

export const faqs: FAQ[] = [
  // Water Heater FAQs
  {
    id: "whq1",
    serviceType: "Water Heater",
    question: "Why is my water heater making a popping or rumbling noise?",
    answer: "That noise is most likely caused by sediment and mineral scale that has built up at the bottom of your tank. As the burner heats the water, steam bubbles form underneath the sediment, and the noise you hear is the sound of those bubbles escaping. This buildup reduces efficiency and can lead to tank damage over time. It's a clear sign your water heater needs to be professionally flushed and inspected.",
  },
  {
    id: "whq2",
    serviceType: "Water Heater",
    question: "My water heater is leaking from the bottom. Is this an emergency?",
    answer: "Yes. A leak from the bottom of the tank itself is a serious issue, typically indicating that the inner tank has corroded through. This is not repairable and is a sign of imminent failure that could lead to significant water damage. You should shut off the water and power supply to the heater and call us for an emergency replacement immediately.",
  },
  {
    id: "whq3",
    serviceType: "Water Heater",
    question: "Should I repair or replace my water heater?",
    answer: "We generally recommend considering replacement if your water heater is 8-12 years old or if the cost of the repair is more than 50% of the cost of a new unit. An older, less efficient unit may continue to have problems, while a new water heater will be more energy-efficient and come with a full manufacturer's warranty. We can provide an honest assessment to help you make the best financial decision.",
  },
  {
    id: "whq4",
    serviceType: "Water Heater",
    question: "How long does a water heater typically last?",
    answer: "Traditional tank water heaters typically last 8-12 years, while tankless models can last 15-20 years with proper maintenance. The lifespan depends on factors like water quality, maintenance frequency, and usage patterns. Regular flushing and anode rod replacement can significantly extend your unit's life.",
  },
  {
    id: "whq5",
    serviceType: "Water Heater",
    question: "What are the benefits of a tankless water heater?",
    answer: "Tankless water heaters provide endless hot water on demand, are more energy-efficient (saving 20-30% on energy costs), take up much less space, and last significantly longer than traditional tank models. They're ideal for families who frequently run out of hot water or want to reduce their energy bills.",
  },
  {
    id: "whq6",
    serviceType: "Water Heater",
    question: "Why does my hot water have a strange smell or color?",
    answer: "A rotten egg smell typically indicates bacteria growth in the tank, often caused by a failing anode rod. Rusty or brown water suggests corrosion inside the tank. Both issues require immediate professional attention, as they can indicate serious problems that may lead to tank failure and water damage.",
  },
  {
    id: "whq7",
    serviceType: "Water Heater",
    question: "How often should I have my water heater serviced?",
    answer: "We recommend annual maintenance for traditional tank water heaters, which includes flushing sediment, checking the anode rod, testing the pressure relief valve, and inspecting all connections. Regular maintenance prevents breakdowns, improves efficiency, and extends the life of your unit.",
  },
  {
    id: "whq8",
    serviceType: "Water Heater",
    question: "Why is my water heater not producing any hot water?",
    answer: "For electric heaters, this usually means a tripped breaker or failed heating element. For gas heaters, it could be a pilot light issue, gas supply problem, or faulty thermocouple. Regardless of the type, a complete loss of hot water requires immediate professional diagnosis to restore service quickly.",
  },
  {
    id: "whq9",
    serviceType: "Water Heater",
    question: "Can you install a water heater in a different location?",
    answer: "Yes, we can relocate water heaters, though it requires careful planning for proper venting (gas units), electrical work, and plumbing modifications. We'll assess your space, ensure code compliance, and provide you with options that meet your needs and budget.",
  },
  {
    id: "whq10",
    serviceType: "Water Heater",
    question: "What size water heater do I need for my home?",
    answer: "The right size depends on your household size and hot water usage patterns. For traditional tanks, we typically recommend 40-50 gallons for 1-3 people, 50-60 gallons for 3-4 people, and 60-80 gallons for larger families. For tankless units, we calculate based on flow rate and temperature rise needed. We'll help you choose the perfect size during our consultation.",
  },
  // Drain Cleaning FAQs
  {
    id: "dcq1",
    serviceType: "Drain Cleaning",
    question: "What are the most common causes of drain clogs?",
    answer: "The cause of a clog really depends on where it is in your house. In the kitchen, the problem is usually FOG—that's fats, oils, and grease—that get poured down the sink and then harden into a stubborn blockage. In the bathroom, the main culprit is hair, which gets tangled up with soap scum and toothpaste to form a solid mass. For toilets, clogs are often from flushing too much toilet paper or things that shouldn't be flushed at all, like paper towels and \"flushable\" wipes.",
  },
  {
    id: "dcq2",
    serviceType: "Drain Cleaning",
    question: "How can I prevent my drains from clogging in the first place?",
    answer: "Prevention is definitely the best strategy! You can avoid most clogs by adopting a few good habits. Most importantly, never pour grease or oil down the kitchen sink; let it cool and throw it in the trash instead. It's also a great idea to use drain strainers or mesh screens on all your sinks and tubs to catch hair and food particles before they go down.",
  },
  {
    id: "dcq3",
    serviceType: "Drain Cleaning",
    question: "What are the warning signs of a developing clog?",
    answer: "Before a drain stops working completely, it will usually give you a few warnings. The most obvious sign is slow draining, where water takes much longer than usual to empty from a sink or tub. You might also hear strange gurgling sounds coming from the pipes as water struggles to get past the partial blockage. Another common sign is a foul odor coming from the drain.",
  },
  {
    id: "dcq4",
    serviceType: "Drain Cleaning",
    question: "Are chemical drain cleaners safe to use?",
    answer: "We strongly recommend avoiding chemical drain cleaners. While they might provide temporary relief, they're often ineffective on tough clogs and can actually damage your pipes over time, especially if you have older plumbing. The caustic chemicals can eat away at pipe walls and create dangerous fumes. Professional mechanical clearing is always the safer, more effective choice.",
  },
  {
    id: "dcq5",
    serviceType: "Drain Cleaning",
    question: "How do you clear tough clogs?",
    answer: "We use professional-grade equipment including motorized drain snakes (augers) that can break through most blockages, and hydro-jetting for severe clogs. Hydro-jetting uses high-pressure water to completely scour the inside of pipes, removing years of buildup. For complex issues, we use video camera inspection to identify the exact location and cause of the problem.",
  },
  {
    id: "dcq6",
    serviceType: "Drain Cleaning",
    question: "How much does professional drain cleaning cost?",
    answer: "The cost depends on the severity and location of the clog. Simple drain snaking for a sink or tub typically ranges from $150-300, while main sewer line cleaning or hydro-jetting can cost more due to the specialized equipment required. We provide upfront pricing before starting any work, so you'll always know the cost in advance with no surprises.",
  },
  // Bathroom FAQs
  {
    id: "baq1",
    serviceType: "Bathroom",
    question: "Why does my bathroom sink and tub drain get clogged so often?",
    answer: "Unlike kitchen clogs which are caused by grease, bathroom clogs are almost always a result of hair, soap scum, and toothpaste building up in the drain and P-trap. Over time, this creates a sticky, stubborn blockage. We recommend avoiding liquid chemical cleaners, as they are often ineffective on this type of clog and can harm your pipes. A professional drain snaking is the best way to thoroughly clear the line.",
  },
  {
    id: "baq2",
    serviceType: "Bathroom",
    question: "The water pressure in my shower is terrible. What's the cause?",
    answer: "In most cases, low shower pressure is caused by a clogged showerhead. Here in Burnet County, our hard water is rich in minerals like calcium and magnesium, which build up over time and block the small holes in your showerhead. You can sometimes fix this by soaking the showerhead in vinegar, but if the buildup is severe or the problem persists, the issue might be a failing shower cartridge, which we can easily replace.",
  },
  {
    id: "baq3",
    serviceType: "Bathroom",
    question: "My bathroom faucet is constantly dripping. Should I be concerned?",
    answer: "Yes, even a small drip should be fixed promptly. A single leaky faucet can waste hundreds of gallons of water a month, which is a big deal for both your utility bill and our local water conservation efforts. The drip is typically caused by a worn-out rubber washer, O-ring, or a faulty ceramic cartridge inside the faucet handle — all of which are quick and inexpensive fixes for a professional plumber.",
  },
  {
    id: "baq4",
    serviceType: "Bathroom",
    question: "Why am I not getting enough hot water in my shower?",
    answer: "If the issue is only happening in one shower, the problem is likely the shower valve's mixing cartridge, which balances the hot and cold water. These can wear out or get clogged with hard water minerals, preventing enough hot water from getting through. If you're having hot water issues throughout the house, then the problem lies with your water heater. We can diagnose the exact cause and get your hot showers back to normal.",
  },
  {
    id: "baq5",
    serviceType: "Bathroom",
    question: "Can you help me install a new sink, faucet, or shower system?",
    answer: "Absolutely. We professionally install all types of bathroom fixtures, including new vanity sinks, modern faucets, and complete shower and tub upgrades with features like rain showerheads and handheld sprayers. Using a licensed plumber is crucial for bathroom renovations to ensure all connections are perfectly sealed, preventing slow leaks behind walls that can cause mold and wood rot.",
  },
  // Toilets FAQs
  {
    id: "toq1",
    serviceType: "Toilets",
    question: "Why does my toilet keep running, and is it a big deal?",
    answer: "A constantly running toilet is usually caused by a worn-out flapper or a faulty fill valve inside the tank. While it may seem like a small annoyance, it's a significant issue that can waste hundreds of gallons of water per day, leading to a surprisingly high water bill. Our plumbers can quickly diagnose and fix the internal components to stop the waste.",
  },
  {
    id: "toq2",
    serviceType: "Toilets",
    question: "My toilet is leaking from the base. How serious is this?",
    answer: "A leak at the base of your toilet is a very serious problem that needs immediate attention. It means the wax ring that seals the toilet to the drainpipe has failed. This allows wastewater to seep out, which can rot your subfloor, damage the foundation or ceiling below, and release unpleasant sewer gas into your home. Shut off the water to the toilet and call us right away.",
  },
  {
    id: "toq3",
    serviceType: "Toilets",
    question: "Why does my toilet keep clogging?",
    answer: "Frequent clogs usually indicate one of several issues: low-flow older toilets that don't have enough flushing power, partial blockages in the drainpipe or vent stack, or items being flushed that shouldn't be (like wipes, even if labeled \"flushable\"). We can diagnose the root cause and recommend solutions, whether that's a simple pipe clearing or upgrading to a modern high-efficiency toilet.",
  },
  {
    id: "toq4",
    serviceType: "Toilets",
    question: "What's the best type of toilet to install?",
    answer: "We typically recommend modern dual-flush or pressure-assisted toilets. They use significantly less water than older models (saving money on your water bill) while providing superior flushing power. Comfort height models are also popular, as they're more accessible and comfortable for most adults. We'll help you choose the best option based on your needs and budget.",
  },
  {
    id: "toq5",
    serviceType: "Toilets",
    question: "How long does a toilet installation take?",
    answer: "A standard toilet replacement typically takes 2-3 hours, including removal of the old toilet, installation of the new one, and cleanup. If there are complications like subfloor damage, flange repairs, or supply line issues, it may take longer. We'll always assess the situation and give you a clear timeline before starting work.",
  },
  // Kitchen FAQs
  {
    id: "kiq1",
    serviceType: "Kitchen",
    question: "Why is my garbage disposal humming but not grinding?",
    answer: "A humming sound usually means the disposal's blades are jammed by something hard, like a bone, fruit pit, or silverware. For safety, you should never put your hand down the disposal. The jam needs to be professionally cleared. To prevent this, avoid putting hard, fibrous (celery, corn husks), or starchy (potato peels, rice) items down the unit.",
  },
  {
    id: "kiq2",
    serviceType: "Kitchen",
    question: "Why is the water pressure from my kitchen faucet suddenly so low?",
    answer: "The most common cause of low pressure in a single faucet is a clogged aerator—the small screen on the tip of the spout. Here in Burnet County, our hard water causes mineral scale to build up and clog these screens over time. You can try unscrewing the aerator and cleaning it, but if that doesn't solve the problem, the issue could be a more complex problem within the faucet's cartridge or supply lines.",
  },
  {
    id: "kiq3",
    serviceType: "Kitchen",
    question: "Can you install a new kitchen faucet or sink?",
    answer: "Absolutely. We install all types of kitchen fixtures, from basic faucets to high-end models with pull-down sprayers and touchless operation. We also handle sink replacements, including undermount and farmhouse styles. Professional installation ensures all connections are properly sealed and functioning correctly, preventing future leaks and water damage.",
  },
  {
    id: "kiq4",
    serviceType: "Kitchen",
    question: "Why does my kitchen drain smell bad?",
    answer: "Foul odors from kitchen drains are usually caused by food particles and grease buildup in the pipes and garbage disposal. Bacteria feed on this organic matter and produce the smell. The P-trap may also have dried out, allowing sewer gases to enter. We can professionally clean your drains and disposal, and identify any underlying issues causing the odor.",
  },
  {
    id: "kiq5",
    serviceType: "Kitchen",
    question: "How do I know if I need to replace my garbage disposal?",
    answer: "Signs you need a replacement include frequent jams, persistent leaks from the unit, strange grinding noises, poor grinding performance, or an age of 10+ years. While some issues can be repaired, disposal units are relatively inexpensive, so replacement is often more cost-effective than repeated repairs. We can assess your unit and recommend the best solution.",
  },
  // Water Treatment FAQs
  {
    id: "wtq1",
    serviceType: "Water Treatment",
    question: "What exactly is \"hard water\" and why is it so common in Burnet County?",
    answer: "Hard water contains high levels of dissolved minerals, primarily calcium and magnesium. Our region's water source, the Trinity Aquifer, flows through vast deposits of limestone, which is rich in these minerals. While safe to drink, this hardness causes the scale buildup that damages appliances and makes cleaning difficult.",
  },
  {
    id: "wtq2",
    serviceType: "Water Treatment",
    question: "What is the best solution for fixing hard water problems?",
    answer: "The most effective solution is a whole-home water softener. A softener uses a process called ion exchange to physically remove the hardness minerals from your water. This protects your entire plumbing system, extends the life of water-using appliances, reduces soap and detergent usage, and leaves your skin, hair, and dishes feeling cleaner.",
  },
  {
    id: "wtq3",
    serviceType: "Water Treatment",
    question: "What are the signs I have hard water?",
    answer: "Common signs include white or chalky buildup on faucets and showerheads, spots on dishes and glassware, soap that doesn't lather well, dry or itchy skin after showering, dull or stiff laundry, and reduced water pressure. You may also notice your water heater and appliances failing prematurely due to scale buildup.",
  },
  {
    id: "wtq4",
    serviceType: "Water Treatment",
    question: "How does a water softener work?",
    answer: "A water softener uses a process called ion exchange. Water flows through a tank filled with resin beads charged with sodium ions. As hard water passes through, the calcium and magnesium minerals stick to the beads while sodium ions are released into the water. Periodically, the system regenerates by flushing the beads with salt water to remove the minerals and recharge the resin.",
  },
  {
    id: "wtq5",
    serviceType: "Water Treatment",
    question: "What's the difference between a water softener and a water filter?",
    answer: "Water softeners remove hardness minerals (calcium and magnesium) to prevent scale buildup and improve water feel. Water filters remove contaminants like chlorine, sediment, bacteria, and chemicals to improve taste, odor, and safety. Many homes benefit from both systems working together—a softener for the whole house and additional filtration for drinking water.",
  },
  {
    id: "wtq6",
    serviceType: "Water Treatment",
    question: "Do I need a whole-house filter or just a drinking water filter?",
    answer: "It depends on your water quality and concerns. If your municipal water has chlorine taste/odor or you have sediment issues, a whole-house filter improves water throughout your home for bathing and laundry. For drinking water safety and taste, an under-sink reverse osmosis (RO) system provides the highest level of filtration. We can test your water and recommend the right solution.",
  },
  {
    id: "wtq7",
    serviceType: "Water Treatment",
    question: "How often do water treatment systems need maintenance?",
    answer: "Water softeners need salt refilled regularly (monthly to quarterly, depending on usage) and professional servicing annually. Reverse osmosis systems need filter changes every 6-12 months and membrane replacement every 2-3 years. Whole-house filters vary by type but typically need filter changes every 3-6 months. We offer maintenance plans to keep your systems running optimally.",
  },
  {
    id: "wtq8",
    serviceType: "Water Treatment",
    question: "Will a water softener make my water taste salty?",
    answer: "No. While water softeners use salt for regeneration, the amount of sodium added to softened water is minimal and typically unnoticeable. If you're on a strict low-sodium diet, you can install a reverse osmosis system at your kitchen sink for drinking and cooking water, or opt for a potassium-based softener instead of sodium.",
  },
  {
    id: "wtq9",
    serviceType: "Water Treatment",
    question: "How much does a water treatment system cost?",
    answer: "Costs vary based on the system type and your home's needs. Basic whole-house water softeners start around $1,500-2,500 installed. Reverse osmosis drinking water systems range from $400-1,500. Whole-house filtration systems vary widely from $800-3,000+ depending on features. We provide free water testing and detailed quotes to help you choose the right system for your budget.",
  },
  // Emergency FAQs
  {
    id: "emq1",
    serviceType: "Emergency",
    question: "What should I do before the plumber arrives?",
    answer: "If you have a major leak, your first step is to shut off the main water valve to your house to prevent further water damage. It's typically located where the main water pipe enters your home, often in a basement, crawl space, or utility closet. For a leaking fixture like a toilet or sink, you can often turn off the water using the small valve located on the pipe directly behind or below it.",
  },
  {
    id: "emq2",
    serviceType: "Emergency",
    question: "What qualifies as a plumbing emergency?",
    answer: "A plumbing emergency is any situation that poses an immediate threat to your property or health. This includes burst pipes, major water leaks, sewer system backups, a completely clogged drain or toilet (especially if it's the only one), or a malfunctioning water heater leaving you with no hot water. If you're unsure, it's always better to call and ask.",
  },
  {
    id: "emq3",
    serviceType: "Emergency",
    question: "Do you really offer 24/7 emergency service?",
    answer: "Yes, we provide true 24/7 emergency plumbing service, 365 days a year including holidays. When you call our emergency line, you'll speak with a real person who can dispatch a licensed plumber to your home immediately. We understand that plumbing emergencies don't wait for business hours, and neither do we.",
  },
  {
    id: "emq4",
    serviceType: "Emergency",
    question: "How quickly can you respond to an emergency?",
    answer: "Our goal is to have a technician at your door within 60-90 minutes of your call, depending on your location and current conditions. We prioritize emergency calls based on severity and always aim to arrive as quickly as possible to minimize damage and restore your plumbing system.",
  },
  {
    id: "emq5",
    serviceType: "Emergency",
    question: "Is emergency service more expensive?",
    answer: "Emergency service calls do have a premium rate to cover after-hours availability and immediate response. However, we still provide upfront pricing before starting work, and acting quickly during an emergency often saves you money by preventing extensive water damage. We'll always discuss costs with you before proceeding with repairs.",
  },
  {
    id: "emq6",
    serviceType: "Emergency",
    question: "What should I do if I have a burst pipe?",
    answer: "First, shut off your main water valve immediately to stop the water flow. Then turn off your home's electricity if water is near electrical outlets or appliances. Move furniture and valuables away from the water, and start removing standing water if safe to do so. Call us immediately—burst pipes can cause thousands of dollars in damage very quickly and require immediate professional repair.",
  },
  // Pipe Replacement FAQs
  {
    id: "prq1",
    serviceType: "Pipe Replacements",
    question: "How long does a replacement take and what does it cost?",
    answer: "A typical line replacement using excavation usually takes several days to complete. The exact timeline and cost depend heavily on factors like the pipe's depth, the total length being replaced, and the type of surface we need to excavate through, such as a garden, concrete sidewalk, or driveway. We provide a detailed, upfront estimate after our on-site evaluation so you can make an informed decision with no hidden fees.",
  },
  {
    id: "prq2",
    serviceType: "Pipe Replacements",
    question: "What causes water and sewer lines to fail here in the Hill Country?",
    answer: "In our part of Texas, the primary cause is our aggressive soil. The clay content causes the ground to expand and shrink dramatically between wet and dry periods, putting immense stress on pipes and causing them to crack and shift. Additionally, the root systems of mature trees, especially Live Oaks, are incredibly powerful and will actively break into pipes seeking water.",
  },
  {
    id: "prq3",
    serviceType: "Pipe Replacements",
    question: "What are the signs I need a sewer line replacement?",
    answer: "Warning signs include frequent backups in multiple drains, gurgling sounds from toilets, sewage odors in your yard, patches of extra-green grass (indicating a leak), foundation cracks, or pooling water in your yard. If you're experiencing multiple drain issues throughout your home, it's likely a main line problem that needs immediate inspection.",
  },
  {
    id: "prq4",
    serviceType: "Pipe Replacements",
    question: "Do you offer trenchless pipe replacement?",
    answer: "Yes, we offer trenchless pipe replacement options when conditions allow. This modern technology can repair or replace underground pipes with minimal digging, preserving your landscaping, driveways, and hardscaping. We use video camera inspection to determine if your pipes are candidates for trenchless methods and provide you with all available options.",
  },
  {
    id: "prq5",
    serviceType: "Pipe Replacements",
    question: "Will my yard be destroyed during pipe replacement?",
    answer: "Traditional excavation does require digging, but we take great care to minimize damage and restore your property afterward. We'll mark out the work area, carefully remove and preserve sod, and backfill and grade properly when finished. For sensitive areas, trenchless technology can dramatically reduce surface disruption. We'll walk you through the entire process before starting work.",
  },
  // Commercial FAQs
  {
    id: "cmq1",
    serviceType: "Commercial",
    question: "What types of commercial properties do you service?",
    answer: "We have extensive experience providing plumbing solutions for a wide range of industries and properties. Our clients include restaurants, bars, office buildings, corporate campuses, retail stores, shopping centers, hotels, hospitals, and schools, as well as apartment complexes and other managed properties.",
  },
  {
    id: "cmq2",
    serviceType: "Commercial",
    question: "Do you offer preventative maintenance plans?",
    answer: "Yes, and we highly recommend them for any business. Our customizable preventative maintenance plans are designed to identify and fix potential issues before they become costly emergencies that cause downtime. Regular service extends the lifespan of your equipment, ensures code compliance, and provides predictable budgeting for your plumbing needs.",
  },
  {
    id: "cmq3",
    serviceType: "Commercial",
    question: "Can you work around our business hours to avoid disruption?",
    answer: "Absolutely. We understand that plumbing work can disrupt your employees, customers, and operations. We offer flexible scheduling, including after-hours and weekend appointments, to perform necessary maintenance, repairs, or installations with minimal impact on your business.",
  },
  {
    id: "cmq4",
    serviceType: "Commercial",
    question: "How quickly do you respond to commercial emergencies?",
    answer: "We know that a plumbing emergency can shut down your business, so we give top priority to commercial emergency calls. Our goal is to dispatch a technician immediately to diagnose the problem, control the situation, and minimize your operational downtime. Our emergency services are available 24 hours a day, every day of the year.",
  },
  {
    id: "cmq5",
    serviceType: "Commercial",
    question: "Are your plumbers licensed for commercial work?",
    answer: "Absolutely. All our plumbers hold proper commercial plumbing licenses and are fully insured for commercial work. We understand that commercial plumbing has different codes, requirements, and complexities than residential work. Our team has extensive experience with commercial systems and stays current with all regulations and best practices.",
  },
  {
    id: "cmq6",
    serviceType: "Commercial",
    question: "Can you handle large commercial projects?",
    answer: "Yes, we have the equipment, expertise, and team size to handle projects of all scales. From small tenant improvements to major facility retrofits, we can manage the entire project including planning, permitting, installation, and final inspection. We work efficiently to minimize disruption to your business operations.",
  },
  {
    id: "cmq7",
    serviceType: "Commercial",
    question: "Do you provide written estimates and documentation?",
    answer: "Yes, we provide detailed written estimates for all commercial work, including scope of work, materials, labor, timeline, and payment terms. We also maintain thorough documentation throughout the project and provide all necessary paperwork for your records, warranty information, and compliance requirements.",
  },
  // General Company FAQs
  {
    id: "gnq1",
    serviceType: "General",
    question: "Are you a licensed and insured plumbing company?",
    answer: "Absolutely. Brandenburg Plumbing is a fully licensed and insured plumbing contractor. Our technicians are certified, highly trained, and undergo regular professional development to stay on top of the latest industry standards and technology. Your peace of mind and safety are our top priorities.",
  },
  {
    id: "gnq2",
    serviceType: "General",
    question: "What areas do you serve?",
    answer: "We proudly provide plumbing services to residential and commercial clients throughout the Highland Lakes & North Austin, including Burnet, Lampasas, Williamson, and Llano counties. If you're unsure whether you fall within our service area, please don't hesitate to call us at 737-251-5032.",
  },
  {
    id: "gnq3",
    serviceType: "General",
    question: "What are your standard hours?",
    answer: "Our standard business hours are Monday through Saturday from 9:00 AM to 5:00 PM. However, we offer 24/7 emergency services for urgent plumbing issues that occur outside of these hours.",
  },
  {
    id: "gnq4",
    serviceType: "General",
    question: "What kind of plumbing services do you offer?",
    answer: "We are a full-service plumbing company. Our services include, but are not limited to:\n\nLeak Detection and Repair\nDrain Cleaning and Unclogging\nWater Heater Installation & Repair (both tank and tankless)\nSewer Line Camera Inspection, Repair, and Replacement\nFaucet, Toilet, and Fixture Repair & Installation\nGas Line Services\nSump Pump Installation and Repair\nWater Filtration and Softener Systems\nPlumbing for Remodels and Additions (not new construction)",
  },
  {
    id: "gnq5",
    serviceType: "General",
    question: "Do you offer preventative maintenance plans?",
    answer: "Yes, we do! Regular maintenance is the best way to prevent costly emergencies and extend the life of your plumbing system. Our maintenance plans include services like drain cleaning, water heater tune-ups, and comprehensive plumbing inspections. Contact us to learn more about our plans.",
  },
  {
    id: "gnq6",
    serviceType: "General",
    question: "How do you charge for your services?",
    answer: "We believe in transparent pricing. For most standard jobs, we offer flat-rate, upfront pricing. This means you'll know the full cost of the job before we begin any work—no hidden fees or surprises. For diagnostics or more complex projects, we will clearly communicate the pricing structure with you.",
  },
  {
    id: "gnq7",
    serviceType: "General",
    question: "Do you provide free estimates?",
    answer: "Yes, we provide free estimates for larger projects like remodels, whole-home repiping, and new installations. For service and repair work, we typically charge a service call fee to cover travel and diagnostics, which is often waived if you proceed with the recommended repairs. Please call us for details.",
  },
  {
    id: "gnq8",
    serviceType: "General",
    question: "What payment methods do you accept?",
    answer: "We accept a variety of payment methods for your convenience, including major credit cards (Visa, MasterCard, American Express), checks, and cash. We also offer financing options for larger projects.",
  },
]

// Get a mix of general FAQs for location pages
export function getGeneralFAQs(count: number = 8): FAQ[] {
  // Select a diverse mix of FAQs from different service types
  const selectedTypes = [
    "Water Heater",
    "Drain Cleaning", 
    "Bathroom",
    "Toilets",
    "Kitchen",
    "Water Treatment",
    "Emergency",
    "Pipe Replacements",
  ]
  
  const result: FAQ[] = []
  
  for (const type of selectedTypes) {
    const typeFaqs = faqs.filter(faq => faq.serviceType === type)
    if (typeFaqs.length > 0 && result.length < count) {
      result.push(typeFaqs[0])
    }
  }
  
  return result
}

// Get FAQs by service type
export function getFAQsByServiceType(serviceType: string): FAQ[] {
  return faqs.filter(faq => faq.serviceType === serviceType)
}

// Map service slugs to FAQ service types
const slugToServiceType: Record<string, string> = {
  'bathroom': 'Bathroom',
  'clogged-pipes': 'Drain Cleaning',
  'commercial': 'Commercial',
  'emergency': 'Emergency',
  'kitchen': 'Kitchen',
  'toilets': 'Toilets',
  'water-filtration': 'Water Treatment',
  'water-heaters': 'Water Heater',
  'water-softeners': 'Water Treatment',
  'water-drain-lines': 'Pipe Replacements',
}

// Get FAQs by service slug (for service pages)
export function getFAQsByServiceSlug(slug: string): FAQ[] {
  const serviceType = slugToServiceType[slug]
  if (!serviceType) {
    return []
  }
  return faqs.filter(faq => faq.serviceType === serviceType)
}

// Get general company FAQs for the FAQ page
export function getGeneralCompanyFAQs(): FAQ[] {
  return faqs.filter(faq => faq.serviceType === "General")
}
