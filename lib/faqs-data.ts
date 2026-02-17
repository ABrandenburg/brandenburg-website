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
  // AC Repair FAQs
  {
    id: "acr1",
    serviceType: "AC Repair",
    question: "Why is my AC running but not cooling the house?",
    answer: "This is one of the most common calls we get during a Central Texas summer. The cause is usually one of a few things: low refrigerant from a leak, a dirty or clogged condenser coil, a failing compressor, or a frozen evaporator coil. Each of these requires professional diagnosis with proper gauges and equipment. We'll pinpoint the problem and give you an honest repair-vs-replace recommendation.",
  },
  {
    id: "acr2",
    serviceType: "AC Repair",
    question: "How often should I change my AC filter?",
    answer: "We recommend checking your filter every 30 days and replacing it at least every 60-90 days, or more frequently if you have pets, allergies, or live in a dusty area. A clogged filter restricts airflow, makes your system work harder, increases energy bills, and can lead to frozen coils and compressor damage. It's the single easiest thing you can do to prevent costly AC repairs.",
  },
  {
    id: "acr3",
    serviceType: "AC Repair",
    question: "Why is my AC making a loud or unusual noise?",
    answer: "Different sounds point to different issues. A grinding or screeching noise usually means a motor bearing is failing. A clicking sound at startup could be a relay problem. A hissing or bubbling sound often indicates a refrigerant leak. A banging noise can mean a loose or broken component inside the compressor. Any unusual sound should be checked promptly to prevent a small repair from turning into a major one.",
  },
  {
    id: "acr4",
    serviceType: "AC Repair",
    question: "Should I repair or replace my air conditioner?",
    answer: "As a general rule, if your AC is over 10-12 years old and the repair cost is more than half the price of a new system, replacement is usually the better investment. Newer systems are significantly more efficient—upgrading from a 10 SEER unit to a 16 SEER can cut your cooling costs by nearly 40%. We'll always give you both options with transparent pricing so you can make the best decision.",
  },
  {
    id: "acr5",
    serviceType: "AC Repair",
    question: "Do you offer emergency AC repair?",
    answer: "Yes. We understand that losing AC in a Texas summer isn't just uncomfortable—it can be dangerous, especially for children and the elderly. We offer priority emergency service and aim to respond as quickly as possible. Our trucks are stocked with the most common parts so we can complete most repairs on the first visit.",
  },
  // AC Installation FAQs
  {
    id: "aci1",
    serviceType: "AC Installation",
    question: "How do I know what size AC system I need?",
    answer: "Proper sizing requires a professional load calculation—not just a guess based on square footage. We evaluate your home's insulation, window placement, ceiling height, ductwork, and local climate data to determine the exact cooling capacity needed. An oversized unit short-cycles and wastes energy, while an undersized unit runs constantly and can't keep up. Getting the size right is the most important part of any installation.",
  },
  {
    id: "aci2",
    serviceType: "AC Installation",
    question: "What SEER rating should I look for in a new AC?",
    answer: "SEER (Seasonal Energy Efficiency Ratio) measures cooling efficiency. The current federal minimum for our region is 15 SEER, but we often recommend 16-18 SEER systems for the best balance of upfront cost and long-term energy savings. Higher SEER units cost more upfront but pay for themselves through lower monthly bills, especially given how many months we run AC here in Central Texas.",
  },
  {
    id: "aci3",
    serviceType: "AC Installation",
    question: "How long does a new AC installation take?",
    answer: "A standard replacement of the outdoor condenser and indoor evaporator coil typically takes one day. If we're also replacing the furnace or air handler, adding a new thermostat, or making ductwork modifications, it may take an additional half day. We'll give you a clear timeline before we start and make sure everything is tested and running perfectly before we leave.",
  },
  {
    id: "aci4",
    serviceType: "AC Installation",
    question: "Will a new AC system work with my existing ductwork?",
    answer: "In most cases, yes—but it depends on the condition and design of your existing ducts. Older or undersized ductwork can restrict airflow and prevent a new system from performing at its rated efficiency. We inspect your ductwork as part of every installation and will let you know if any modifications, sealing, or insulation upgrades are needed to get the most out of your investment.",
  },
  {
    id: "aci5",
    serviceType: "AC Installation",
    question: "Do you offer financing for new AC systems?",
    answer: "Yes, we offer flexible financing options to help make a new AC system affordable. We understand that a full system replacement is a significant investment, and we want to make sure comfort is accessible. We'll walk you through all available options, including any manufacturer rebates or utility company incentives that may apply to your installation.",
  },
  // Heating Repair FAQs
  {
    id: "htr1",
    serviceType: "Heating Repair",
    question: "Why is my furnace blowing cold air?",
    answer: "A furnace blowing cold air is typically caused by a faulty ignitor, a bad flame sensor, a tripped high-limit switch, or a thermostat issue. The high-limit switch is a safety device that shuts off the burner if the heat exchanger overheats, often due to restricted airflow from a dirty filter. We diagnose the root cause and fix it properly so you're not dealing with the same problem again next week.",
  },
  {
    id: "htr2",
    serviceType: "Heating Repair",
    question: "My heater smells like something is burning. Is this dangerous?",
    answer: "A brief burning smell when you first turn on your heater after months of not using it is usually just dust burning off the heat exchanger and is normal. However, if the smell persists, smells like plastic or electrical burning, or is accompanied by unusual noises, shut the system off and call us immediately. These could indicate a serious issue like an overheating motor or electrical problem.",
  },
  {
    id: "htr3",
    serviceType: "Heating Repair",
    question: "How often should my heating system be serviced?",
    answer: "We recommend annual maintenance before the heating season begins, ideally in the fall. A tune-up includes cleaning the burners, checking the heat exchanger for cracks, testing the ignition system, verifying gas pressure, inspecting the flue, and checking all safety controls. Regular maintenance prevents breakdowns, catches carbon monoxide risks early, and keeps your manufacturer warranty valid.",
  },
  {
    id: "htr4",
    serviceType: "Heating Repair",
    question: "Why does my heater keep turning on and off?",
    answer: "Short-cycling—where your heater repeatedly starts and stops—is usually caused by an overheating heat exchanger (often from a dirty filter), a malfunctioning flame sensor, or a thermostat issue. It wastes energy, puts excessive wear on your system, and can lead to premature failure. This should be addressed promptly, as it can also indicate a cracked heat exchanger, which is a carbon monoxide safety concern.",
  },
  {
    id: "htr5",
    serviceType: "Heating Repair",
    question: "Do you repair all types of heating systems?",
    answer: "Yes, our technicians are trained and experienced with all types of residential heating systems, including gas furnaces, electric furnaces, heat pumps, and dual-fuel hybrid systems. We work on all major brands and carry common replacement parts on our trucks for faster repairs.",
  },
  // Heating Installation FAQs
  {
    id: "hti1",
    serviceType: "Heating Installation",
    question: "Should I choose a furnace or a heat pump for my home?",
    answer: "It depends on your home and priorities. Heat pumps are extremely efficient for heating in mild climates like Central Texas and also provide cooling, making them a versatile two-in-one solution. Gas furnaces deliver stronger heat output for the coldest days. Many homeowners are choosing dual-fuel systems that combine both—the heat pump handles most of the winter, and the furnace kicks in only when temperatures drop significantly.",
  },
  {
    id: "hti2",
    serviceType: "Heating Installation",
    question: "How long does a new furnace or heating system last?",
    answer: "A gas furnace typically lasts 15-20 years, while heat pumps average 12-15 years. Proper sizing, quality installation, and regular maintenance are the biggest factors in how long your system will last. We ensure every installation is done right the first time, with proper airflow, gas connections, and safety testing to maximize the life and performance of your new system.",
  },
  {
    id: "hti3",
    serviceType: "Heating Installation",
    question: "Are there any rebates or incentives for a new heating system?",
    answer: "Yes, there are often manufacturer rebates, utility company incentives, and federal tax credits available for high-efficiency heating equipment, especially heat pumps. These incentives can significantly reduce your out-of-pocket cost. We stay current on all available programs and will help you identify every rebate and credit you qualify for during our consultation.",
  },
  {
    id: "hti4",
    serviceType: "Heating Installation",
    question: "What size heating system do I need?",
    answer: "Just like AC, proper sizing is critical. We perform a detailed load calculation that accounts for your home's square footage, insulation levels, window types, ceiling heights, and local climate data. An oversized heater short-cycles and creates uncomfortable temperature swings, while an undersized unit runs constantly and never reaches your desired temperature. We get the sizing right so your home stays comfortable and efficient.",
  },
  {
    id: "hti5",
    serviceType: "Heating Installation",
    question: "How long does a heating system installation take?",
    answer: "A standard furnace replacement typically takes one day. If we're installing a complete system change—like switching from a furnace to a heat pump, or adding a dual-fuel system—it may take one to two days depending on the scope of work. We handle all the details, including removing and disposing of your old equipment, and make sure everything is tested and running before we leave.",
  },
  // Ductwork FAQs
  {
    id: "dw1",
    serviceType: "Ductwork",
    question: "How do I know if my ductwork is leaking?",
    answer: "Common signs of leaky ductwork include rooms that are consistently too hot or too cold, higher-than-expected energy bills, excessive dust in your home, and your HVAC system running longer than it should. In Texas, where most ductwork runs through unconditioned attic space, leaks are extremely common and can waste 20-30% of your conditioned air. We use diagnostic tools to test your ducts and pinpoint exactly where the leaks are.",
  },
  {
    id: "dw2",
    serviceType: "Ductwork",
    question: "Why is duct insulation so important in Texas?",
    answer: "Texas attic temperatures can easily reach 140°F or more in summer. When your cold, conditioned air travels through uninsulated or poorly insulated ducts in that extreme heat, it can warm up by 10-20 degrees before it even reaches your rooms. This forces your AC to work much harder and drives up your energy bills. Properly insulated ducts maintain the temperature of the air and dramatically improve system efficiency.",
  },
  {
    id: "dw3",
    serviceType: "Ductwork",
    question: "Can ductwork affect my indoor air quality?",
    answer: "Absolutely. Leaky ducts in your attic or crawl space can pull in dust, insulation fibers, mold spores, and other contaminants and distribute them throughout your home. Poorly sealed duct connections also allow humid outside air into the system, which can promote mold growth inside the ducts. Sealing and cleaning your ductwork is one of the most effective ways to improve the air quality in your home.",
  },
  {
    id: "dw4",
    serviceType: "Ductwork",
    question: "How long does ductwork last?",
    answer: "Most ductwork is designed to last 15-25 years, but in Texas attics where temperatures are extreme, flex duct can deteriorate faster. The connections, tape, and insulation break down over time, leading to leaks and reduced efficiency. If your ductwork is over 15 years old, we recommend a professional inspection to assess its condition and identify any areas that need repair or replacement.",
  },
  {
    id: "dw5",
    serviceType: "Ductwork",
    question: "Do you design and install new duct systems?",
    answer: "Yes, we design and install complete duct systems for home additions, renovations, and new construction. Proper duct design is critical to system performance—it ensures the right amount of airflow reaches every room. We calculate the correct duct sizes, plan efficient layouts, and use quality materials to deliver a system that keeps your home comfortable and your energy bills low.",
  },
  // Heat Pump FAQs
  {
    id: "hp1",
    serviceType: "Heat Pumps",
    question: "How does a heat pump work?",
    answer: "A heat pump works like an air conditioner that can run in reverse. In summer, it removes heat from inside your home and transfers it outside, just like a standard AC. In winter, it reverses the process, extracting heat energy from the outdoor air and moving it inside to warm your home. This makes it a highly efficient two-in-one system for both heating and cooling.",
  },
  {
    id: "hp2",
    serviceType: "Heat Pumps",
    question: "Are heat pumps effective in Texas?",
    answer: "Heat pumps are an excellent choice for Central Texas. Our mild winters are ideal for heat pump efficiency—they work best when outdoor temperatures stay above freezing, which covers the vast majority of our heating season. For the rare deep freezes, a dual-fuel system that pairs the heat pump with a gas furnace backup gives you the best of both worlds: efficiency most of the time and powerful heat when you need it most.",
  },
  {
    id: "hp3",
    serviceType: "Heat Pumps",
    question: "What is a dual-fuel or hybrid heat pump system?",
    answer: "A dual-fuel system combines an electric heat pump with a gas furnace. The heat pump handles heating and cooling most of the year at high efficiency. When outdoor temperatures drop below a set point (usually around 35-40°F), the system automatically switches to the gas furnace for stronger, more economical heating. It's the most versatile and efficient setup for Texas homeowners who want year-round comfort without compromise.",
  },
  {
    id: "hp4",
    serviceType: "Heat Pumps",
    question: "How much can I save with a heat pump?",
    answer: "Heat pumps are significantly more efficient than traditional heating and cooling systems. Many homeowners see a 30-50% reduction in heating costs compared to a standard gas furnace or electric resistance heat. Because the system also provides cooling, you get year-round savings. Combined with available federal tax credits and utility rebates for high-efficiency heat pumps, the long-term savings can be substantial.",
  },
  {
    id: "hp5",
    serviceType: "Heat Pumps",
    question: "How long does a heat pump last?",
    answer: "A well-maintained heat pump typically lasts 12-15 years. Because it runs year-round for both heating and cooling, it does work harder than a furnace that only runs in winter. Regular maintenance—including annual tune-ups, filter changes, and keeping the outdoor unit clean—is key to maximizing its lifespan and performance. We offer maintenance plans to help you protect your investment.",
  },
  // General Company FAQs
  {
    id: "gnq1",
    serviceType: "General",
    question: "Are you a licensed and insured plumbing company?",
    answer: "Absolutely. Brandenburg Plumbing is a fully licensed and insured plumbing and HVAC contractor. Our technicians are certified, highly trained, and undergo regular professional development to stay on top of the latest industry standards and technology. Your peace of mind and safety are our top priorities.",
  },
  {
    id: "gnq2",
    serviceType: "General",
    question: "What areas do you serve?",
    answer: "We proudly provide plumbing and HVAC services to residential and commercial clients throughout the Highland Lakes & North Austin, including Burnet, Lampasas, Williamson, and Llano counties. If you're unsure whether you fall within our service area, please don't hesitate to call us at 737-251-5032.",
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
    question: "What kind of plumbing and HVAC services do you offer?",
    answer: "We are a full-service plumbing and HVAC company. Our services include, but are not limited to:\n\nLeak Detection and Repair\nDrain Cleaning and Unclogging\nWater Heater Installation & Repair (both tank and tankless)\nSewer Line Camera Inspection, Repair, and Replacement\nFaucet, Toilet, and Fixture Repair & Installation\nGas Line Services\nSump Pump Installation and Repair\nWater Filtration and Softener Systems\nAC Repair and Installation\nHeating Repair and Installation\nHeat Pump Services\nDuctwork Sealing, Insulation, and Design\nPlumbing for Remodels and Additions (not new construction)",
  },
  {
    id: "gnq5",
    serviceType: "General",
    question: "Do you offer preventative maintenance plans?",
    answer: "Yes, we do! Regular maintenance is the best way to prevent costly emergencies and extend the life of your plumbing and HVAC systems. Our maintenance plans include services like drain cleaning, water heater tune-ups, AC tune-ups, and comprehensive plumbing and HVAC inspections. Contact us to learn more about our plans.",
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
    "AC Repair",
    "Heating Repair",
    "Heat Pumps",
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
  'ac-repair': 'AC Repair',
  'ac-installation': 'AC Installation',
  'heating-repair': 'Heating Repair',
  'heating-installation': 'Heating Installation',
  'ductwork': 'Ductwork',
  'heat-pumps': 'Heat Pumps',
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
