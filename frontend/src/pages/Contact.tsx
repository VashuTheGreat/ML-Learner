import { useState } from "react";
import { Mail, Phone, MapPin, Send, MessageSquare, Twitter, Github, Linkedin, ArrowRight } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

const Contact = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: ""
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Contact form submitted:", formData);
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setFormData({ name: "", email: "", subject: "", message: "" });
    }, 3000);
  };

  const contactInfo = [
    {
      icon: Mail,
      label: "Email Us",
      value: "hello@mllearner.com",
      description: "Drop us a line anytime",
      color: "from-primary to-accent",
      iconBg: "bg-primary/10 text-primary",
    },
    {
      icon: Phone,
      label: "Call Us",
      value: "+91 123 456 7890",
      description: "Mon–Fri, 9am–6pm IST",
      color: "from-accent to-secondary",
      iconBg: "bg-accent/10 text-accent",
    },
    {
      icon: MapPin,
      label: "Find Us",
      value: "Mumbai, India",
      description: "Come say hello",
      color: "from-secondary to-primary",
      iconBg: "bg-secondary/20 text-secondary-foreground",
    },
  ];

  const socials = [
    { icon: Twitter, label: "Twitter", href: "#", color: "hover:text-sky-400 hover:border-sky-400/40 hover:bg-sky-400/10" },
    { icon: Github, label: "GitHub", href: "#", color: "hover:text-foreground hover:border-border hover:bg-muted" },
    { icon: Linkedin, label: "LinkedIn", href: "#", color: "hover:text-blue-500 hover:border-blue-400/40 hover:bg-blue-500/10" },
    { icon: MessageSquare, label: "Discord", href: "#", color: "hover:text-indigo-500 hover:border-indigo-400/40 hover:bg-indigo-500/10" },
  ];

  return (
    <div className="min-h-screen">
      <Navbar />

      {/* ── Hero ─────────────────────────────────────────── */}
      <section className="relative pt-32 pb-24 mesh-gradient overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-20 left-1/4 w-72 h-72 bg-primary/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-secondary/10 rounded-full blur-3xl" />
        </div>
        <div className="container mx-auto px-6 relative">
          <div className="text-center max-w-3xl mx-auto animate-fade-in">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-semibold mb-6">
              <MessageSquare className="w-4 h-4" />
              We'd love to hear from you
            </div>
            <h1 className="text-5xl md:text-6xl font-extrabold mb-5 leading-tight">
              Get in <span className="gradient-text">Touch</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-xl mx-auto leading-relaxed">
              Have questions, ideas, or feedback? Send us a message and we'll get back to you as soon as possible.
            </p>
          </div>
        </div>
      </section>

      {/* ── Contact Info Tiles ───────────────────────────── */}
      <section className="py-16">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 -mt-12 mb-20">
            {contactInfo.map((info, index) => (
              <div
                key={index}
                className="bg-card border border-border rounded-2xl p-6 flex items-start gap-4 group card-hover shadow-sm hover:shadow-primary/10"
              >
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 transition-transform duration-300 group-hover:scale-110 ${info.iconBg}`}>
                  <info.icon className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1">{info.label}</p>
                  <p className="font-bold text-foreground">{info.value}</p>
                  <p className="text-sm text-muted-foreground">{info.description}</p>
                </div>
              </div>
            ))}
          </div>

          {/* ── Main Grid ────────────────────────────────── */}
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-12">

            {/* Left: Socials + blurb */}
            <div className="lg:col-span-2 space-y-8">
              <div>
                <h2 className="text-2xl font-bold mb-3">Connect With Us</h2>
                <p className="text-muted-foreground leading-relaxed">
                  Follow our journey, contribute ideas, or just reach out on your favourite platform. We're active everywhere.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {socials.map((s) => (
                  <a
                    key={s.label}
                    href={s.href}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl border border-border text-muted-foreground transition-all duration-300 ${s.color} group`}
                  >
                    <s.icon className="w-5 h-5" />
                    <span className="text-sm font-semibold">{s.label}</span>
                    <ArrowRight className="w-4 h-4 ml-auto opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                  </a>
                ))}
              </div>

              {/* decorative blurb card */}
              <div className="relative rounded-2xl overflow-hidden p-6 bg-gradient-to-br from-primary/10 via-secondary/10 to-accent/10 border border-border">
                <div className="absolute -top-8 -right-8 w-24 h-24 bg-primary/10 rounded-full blur-2xl" />
                <p className="text-sm font-semibold text-muted-foreground italic leading-relaxed">
                  "Our average response time is under 2 hours during business hours."
                </p>
                <div className="mt-4 flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                  <span className="text-xs font-bold text-green-500">Support Online</span>
                </div>
              </div>
            </div>

            {/* Right: Form */}
            <div className="lg:col-span-3">
              <div className="bg-card border border-border rounded-3xl p-8 shadow-xl relative overflow-hidden">
                <div className="absolute -top-16 -right-16 w-48 h-48 bg-primary/5 rounded-full blur-3xl pointer-events-none" />

                <h2 className="text-2xl font-bold mb-2">Send a Message</h2>
                <p className="text-muted-foreground text-sm mb-8">We'll respond within 24 hours.</p>

                {submitted ? (
                  <div className="flex flex-col items-center justify-center py-16 text-center gap-4 animate-scale-in">
                    <div className="w-16 h-16 rounded-full bg-green-500/10 border border-green-500/20 flex items-center justify-center">
                      <Send className="w-8 h-8 text-green-500" />
                    </div>
                    <h3 className="text-xl font-bold text-foreground">Message Sent!</h3>
                    <p className="text-muted-foreground max-w-xs">Thanks for reaching out. We'll get back to you shortly.</p>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div className="space-y-2">
                        <label className="text-sm font-semibold text-foreground">Your Name</label>
                        <input
                          type="text"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          placeholder="John Doe"
                          className="input-field"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-semibold text-foreground">Email Address</label>
                        <input
                          type="email"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          placeholder="you@example.com"
                          className="input-field"
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-foreground">Subject</label>
                      <input
                        type="text"
                        value={formData.subject}
                        onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                        placeholder="How can we help?"
                        className="input-field"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-foreground">Message</label>
                      <textarea
                        value={formData.message}
                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                        placeholder="Write your message here..."
                        rows={5}
                        className="input-field resize-none"
                        required
                      />
                    </div>

                    <button type="submit" id="contact-submit-btn" className="btn-primary flex items-center gap-2 w-full justify-center">
                      Send Message
                      <Send className="w-4 h-4" />
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Contact;
