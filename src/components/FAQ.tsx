import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronDown, HelpCircle, Hammer, DollarSign, Ruler, ClipboardCheck, Zap, ArrowRight } from 'lucide-react';

interface FAQItem {
  question: string;
  answer: string;
  category: string;
}

const faqData: FAQItem[] = [
  // General
  {
    category: 'General',
    question: 'What exactly is a barndominium?',
    answer: 'A barndominium — often called a "barndo" — merges a metal or post-frame building structure with fully customized living space. They typically feature open floor plans, soaring ceilings, and styling that ranges from rustic farmhouse to sleek modern. Many barndominiums also incorporate integrated workshops, garages, or storage areas alongside the living quarters.'
  },
  {
    category: 'General',
    question: 'What are the benefits of building a barndominium compared to a traditional house?',
    answer: 'Barndominiums offer several advantages over traditional construction: potentially faster shell construction timelines, exceptional design flexibility with wide-open floor plans, strong energy efficiency when properly insulated, superior durability against severe weather, and the ability to integrate functional spaces like workshops, garages, and storage areas directly into the home.'
  },
  {
    category: 'General',
    question: 'Can barndominium builders also construct other types of buildings?',
    answer: 'Many barndominium builders also specialize in custom workshops, detached garages, agricultural buildings, and other steel or post-frame structures. The core construction methods overlap significantly, so experienced barndo builders are often well-equipped to handle these related projects.'
  },
  // Design
  {
    category: 'Design',
    question: 'Do I need my own architect, or can a barndominium builder help with design?',
    answer: 'Most experienced barndominium builders offer in-house design services that specialize in the unique structural and aesthetic considerations of metal building homes. Working with a builder who understands barndo-specific building codes and structural requirements can ensure your design is both optimized and buildable. However, you\'re always welcome to bring your own architect or plans.'
  },
  {
    category: 'Design',
    question: 'What does the barndominium design phase involve?',
    answer: 'The design phase typically starts with an initial consultation to understand your vision, budget, and site conditions. From there, designers create layout sketches and work through revisions with you. The process culminates in full architectural and structural blueprints that are ready for permitting and construction. Expect to discuss room layouts, ceiling heights, exterior finishes, and any special features like shops or RV bays.'
  },
  {
    category: 'Design',
    question: 'Why is it important to finalize plans before getting a detailed quote?',
    answer: 'Finalized plans ensure accurate pricing by defining the exact scope of work, materials, and finishes. They streamline the scheduling and permitting process, and allow you to make informed design decisions early — when changes are inexpensive — rather than mid-construction when modifications can be costly and cause delays.'
  },
  // Construction
  {
    category: 'Construction',
    question: 'How long does it typically take to build a custom barndominium?',
    answer: 'Most custom barndominiums take between 8 to 15 months from site preparation to move-in. The timeline varies based on the complexity of the design, weather conditions, the speed of decision-making during construction, and local permitting timelines. Simpler, smaller builds can sometimes be completed faster, while highly custom projects may take longer.'
  },
  {
    category: 'Construction',
    question: 'What are the main stages of the construction process?',
    answer: 'The typical construction process follows these stages: Site Preparation (clearing, grading, foundation), Framing & Shell (erecting the steel or post-frame structure), Exterior Envelope (roofing, siding, windows, doors), Rough-Ins (electrical, plumbing, HVAC), Insulation, Drywall & Interior Finishing, Exterior Finishes (porches, landscaping), and Final Inspections before move-in.'
  },
  {
    category: 'Construction',
    question: 'Does the builder handle the permitting process?',
    answer: 'Yes, most experienced barndominium builders manage the building permit applications and work directly with local authorities to ensure full compliance with regional building codes. This includes submitting engineered plans, coordinating inspections at each construction stage, and handling any required variances or special approvals.'
  },
  // Planning
  {
    category: 'Planning',
    question: 'What key things should I consider before starting a barndominium build?',
    answer: 'Before breaking ground, carefully consider: your total budget (including land, site prep, and finishes), land suitability and local zoning regulations, financing options (construction-to-permanent loans are common), utility access and hookup costs, your desired size and layout, local building codes and requirements, and climate-specific strategies for insulation and HVAC.'
  },
  {
    category: 'Planning',
    question: 'How energy efficient are barndominiums?',
    answer: 'When properly built, barndominiums can be extremely energy efficient. Key strategies include high R-value spray foam or rigid insulation, radiant barrier roof decking, energy-efficient HVAC systems sized for the open floor plans, proper air sealing at all penetrations, and energy-efficient windows and doors. The metal exterior also reflects solar heat, which can reduce cooling costs.'
  },
  // Cost
  {
    category: 'Cost',
    question: "What's the typical cost for a custom barndominium?",
    answer: 'Barndominium costs vary significantly based on design complexity, square footage, interior finishes, site conditions, and regional labor rates. A basic shell-only build starts at a lower price point, while fully finished luxury barndos with high-end finishes can rival custom home prices. The best approach is to work with a builder to get a detailed quote once your plans are finalized.'
  },
  {
    category: 'Cost',
    question: 'What financing options are available for barndominium construction?',
    answer: 'Construction-to-permanent loans are the most common financing option for barndominiums. These loans cover the construction phase and automatically convert to a traditional mortgage upon completion. Some lenders also offer standalone construction loans, USDA rural development loans, or FHA loans depending on the property and your qualifications. It\'s important to work with a lender experienced in barndominium projects, as not all banks are familiar with this building type.'
  },
  // Getting Started
  {
    category: 'Getting Started',
    question: 'How do I get started with my barndominium project?',
    answer: 'The best first step is to connect with an experienced barndominium builder in your area for an initial consultation. During this conversation, you\'ll discuss your ideas, budget, timeline, and property details. From there, the builder can guide you through the design process and provide a realistic project estimate. You can use our Find a Builder tool to locate verified barndominium specialists near you.'
  },
];

const categories = ['All', 'General', 'Design', 'Construction', 'Planning', 'Cost', 'Getting Started'];

const categoryIcons: Record<string, React.ReactNode> = {
  General: <HelpCircle size={18} />,
  Design: <Ruler size={18} />,
  Construction: <Hammer size={18} />,
  Planning: <ClipboardCheck size={18} />,
  Cost: <DollarSign size={18} />,
  'Getting Started': <ArrowRight size={18} />,
};

interface FAQProps {
  onStartChat: () => void;
  onFindBuilder: () => void;
}

export default function FAQ({ onStartChat, onFindBuilder }: FAQProps) {
  const [activeCategory, setActiveCategory] = useState('All');
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const filteredFAQs = activeCategory === 'All'
    ? faqData
    : faqData.filter(faq => faq.category === activeCategory);

  const toggleQuestion = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="space-y-16">
      {/* Header */}
      <section className="text-center space-y-6">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-2 px-4 py-2 bg-brand-primary/10 text-brand-primary rounded-full text-sm font-bold"
        >
          <HelpCircle size={16} />
          Frequently Asked Questions
        </motion.div>
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-5xl md:text-6xl font-serif italic text-stone-900"
        >
          Barndominium <span className="text-brand-primary">FAQ</span>
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-lg text-stone-600 max-w-2xl mx-auto leading-relaxed"
        >
          Everything you need to know about building a barndominium — from design and construction to financing and getting started.
        </motion.p>
      </section>

      {/* Category Filters */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="flex flex-wrap justify-center gap-3"
      >
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => {
              setActiveCategory(category);
              setOpenIndex(null);
            }}
            className={`px-5 py-2.5 rounded-full text-sm font-bold transition-all ${
              activeCategory === category
                ? 'bg-brand-primary text-white shadow-lg shadow-brand-primary/20'
                : 'bg-white text-stone-600 hover:bg-stone-50 border border-stone-200'
            }`}
          >
            {category}
          </button>
        ))}
      </motion.div>

      {/* FAQ Items */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="max-w-3xl mx-auto space-y-4"
      >
        {filteredFAQs.map((faq, index) => (
          <motion.div
            key={`${activeCategory}-${index}`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow"
          >
            <button
              onClick={() => toggleQuestion(index)}
              className="w-full flex items-center justify-between p-6 text-left gap-4"
            >
              <div className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                  openIndex === index
                    ? 'bg-brand-primary text-white'
                    : 'bg-stone-100 text-stone-500'
                } transition-colors`}>
                  {categoryIcons[faq.category] || <HelpCircle size={18} />}
                </div>
                <span className={`font-bold text-base ${
                  openIndex === index ? 'text-brand-primary' : 'text-stone-900'
                } transition-colors`}>
                  {faq.question}
                </span>
              </div>
              <ChevronDown
                size={20}
                className={`text-stone-400 shrink-0 transition-transform duration-300 ${
                  openIndex === index ? 'rotate-180 text-brand-primary' : ''
                }`}
              />
            </button>
            <AnimatePresence>
              {openIndex === index && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3, ease: 'easeInOut' }}
                  className="overflow-hidden"
                >
                  <div className="px-6 pb-6 pl-20">
                    <p className="text-stone-600 leading-relaxed">{faq.answer}</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ))}
      </motion.div>

      {/* Still Have Questions CTA */}
      <section className="bg-brand-primary rounded-[3rem] p-12 md:p-16 text-center space-y-8 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
          <div className="absolute top-10 left-10 w-64 h-64 bg-white rounded-full blur-3xl" />
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-brand-accent rounded-full blur-3xl" />
        </div>

        <h2 className="text-3xl md:text-4xl font-serif italic text-white relative z-10">
          Still have questions?
        </h2>
        <p className="text-white/80 text-lg max-w-xl mx-auto relative z-10">
          Our AI expert has been trained on thousands of barndominium projects and can answer your specific questions instantly.
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-4 relative z-10">
          <button
            onClick={onStartChat}
            className="px-10 py-4 bg-white text-brand-primary rounded-full font-bold hover:bg-stone-50 transition-all shadow-xl flex items-center justify-center gap-2 group"
          >
            Ask Our AI Expert
            <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
          </button>
          <button
            onClick={onFindBuilder}
            className="px-10 py-4 bg-brand-primary/20 text-white rounded-full font-bold hover:bg-brand-primary/30 transition-all border border-white/20 flex items-center justify-center gap-2"
          >
            <Zap size={20} />
            Find a Builder
          </button>
        </div>
      </section>
    </div>
  );
}
