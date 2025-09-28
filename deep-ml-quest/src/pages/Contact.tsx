import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Mail, MessageCircle, Github, Twitter } from "lucide-react";

const Contact = () => {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-foreground mb-4">
            Get in Touch
          </h1>
          <p className="text-xl text-muted-foreground">
            Have questions? We'd love to hear from you. Send us a message and we'll respond as soon as possible.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Contact Form */}
          <Card className="border-border">
            <CardHeader>
              <CardTitle className="text-2xl text-foreground">Send us a Message</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input 
                    id="firstName" 
                    placeholder="John"
                    className="bg-background border-border" 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input 
                    id="lastName" 
                    placeholder="Doe"
                    className="bg-background border-border" 
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input 
                  id="email" 
                  type="email" 
                  placeholder="john.doe@example.com"
                  className="bg-background border-border" 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="subject">Subject</Label>
                <Input 
                  id="subject" 
                  placeholder="How can we help you?"
                  className="bg-background border-border" 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="message">Message</Label>
                <Textarea 
                  id="message" 
                  placeholder="Tell us more about your question or feedback..."
                  rows={6}
                  className="bg-background border-border" 
                />
              </div>
              <Button className="w-full" size="lg">
                Send Message
              </Button>
            </CardContent>
          </Card>

          {/* Contact Info */}
          <div className="space-y-8">
            <Card className="border-border">
              <CardHeader>
                <CardTitle className="text-xl text-foreground">Other Ways to Reach Us</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Mail className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">Email</h3>
                    <p className="text-muted-foreground">support@deepmllearner.com</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      We'll get back to you within 24 hours.
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-10 h-10 bg-success/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <MessageCircle className="h-5 w-5 text-success" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">Community Forum</h3>
                    <p className="text-muted-foreground">Join our Discord community</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Get help from other learners and experts.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Social Links */}
            <Card className="border-border">
              <CardHeader>
                <CardTitle className="text-xl text-foreground">Follow Us</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex space-x-4">
                  <Button variant="outline" size="icon" className="border-border">
                    <Github className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="icon" className="border-border">
                    <Twitter className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="icon" className="border-border">
                    <Mail className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground mt-4">
                  Stay updated with the latest features, tutorials, and community highlights.
                </p>
              </CardContent>
            </Card>

            {/* FAQ */}
            <Card className="border-border">
              <CardHeader>
                <CardTitle className="text-xl text-foreground">Quick Questions?</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium text-foreground">Is Deep ML Learner free?</h4>
                    <p className="text-sm text-muted-foreground">
                      Yes! We offer a free tier with access to basic problems and tutorials.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-medium text-foreground">Do you offer certificates?</h4>
                    <p className="text-sm text-muted-foreground">
                      We're working on a certification program. Stay tuned for updates!
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;