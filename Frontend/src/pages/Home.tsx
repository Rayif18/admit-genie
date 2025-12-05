import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Bot,
  GraduationCap,
  Clock,
  TrendingUp,
  MessageSquare,
  Sparkles,
  CheckCircle,
  ArrowRight,
} from "lucide-react";
import Navigation from "@/components/Navigation";
import heroImage from "@/assets/hero-bg.jpg";

const Home = () => {
  const features = [
    {
      icon: Bot,
      title: "AI-Powered Assistant",
      description: "Get instant answers to all your admission queries with our intelligent chatbot",
    },
    {
      icon: GraduationCap,
      title: "College Predictions",
      description: "Find the best colleges based on your CET rank with AI-driven predictions",
    },
    {
      icon: Clock,
      title: "Real-time Updates",
      description: "Stay informed with live exam schedules, deadlines, and admission dates",
    },
    {
      icon: TrendingUp,
      title: "Accurate Analytics",
      description: "Historical cutoff data and trends to help you make informed decisions",
    },
  ];

  const benefits = [
    "Personalized college recommendations",
    "24/7 AI admission counseling",
    "Complete admission information",
    "Save and compare colleges",
    "Download prediction reports",
    "Track application deadlines",
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        {/* Background Image with Overlay */}
        <div
          className="absolute inset-0 z-0"
          style={{
            backgroundImage: `url(${heroImage})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-background/95 via-background/90 to-background" />
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center animate-fade-in">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/10 border border-secondary/20 mb-6">
              <Sparkles className="w-4 h-4 text-secondary" />
              <span className="text-sm font-medium text-secondary">
                AI-Powered Admission Assistant
              </span>
            </div>

            <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-primary via-primary to-secondary bg-clip-text text-transparent leading-tight">
              Your Journey to the Perfect College Starts Here
            </h1>

            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Admit Genie uses advanced AI to guide you through the Indian college admission
              process. Get instant answers, predict your college chances, and make informed
              decisions.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link to="/chatbot">
                <Button variant="hero" size="lg" className="group">
                  <MessageSquare className="w-5 h-5" />
                  Start Chat
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Link to="/predictor">
                <Button variant="glass" size="lg">
                  <GraduationCap className="w-5 h-5" />
                  Predict Colleges
                </Button>
              </Link>
              <Link to="/colleges">
                <Button variant="glass" size="lg">
                  <GraduationCap className="w-5 h-5" />
                  Browse Colleges
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Floating Elements */}
        <div className="absolute top-20 left-10 w-20 h-20 bg-primary/10 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-20 right-10 w-32 h-32 bg-secondary/10 rounded-full blur-3xl animate-float" style={{ animationDelay: "1s" }} />
      </section>

      {/* Features Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Everything You Need for College Admissions
            </h2>
            <p className="text-lg text-muted-foreground">
              Comprehensive tools and insights powered by artificial intelligence
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <Card
                  key={index}
                  className="p-6 hover:shadow-glow transition-all duration-300 hover:scale-105 bg-card/50 backdrop-blur-sm border-border/50 animate-fade-in"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="w-12 h-12 bg-gradient-primary rounded-lg flex items-center justify-center mb-4">
                    <Icon className="w-6 h-6 text-primary-foreground" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="animate-fade-in">
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                Why Choose Admit Genie?
              </h2>
              <p className="text-lg text-muted-foreground mb-8">
                Our platform combines cutting-edge AI technology with comprehensive admission data
                to provide you with the best guidance for your college journey.
              </p>
              <div className="space-y-4">
                {benefits.map((benefit, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-3 animate-fade-in"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <div className="flex-shrink-0 w-6 h-6 bg-secondary/20 rounded-full flex items-center justify-center">
                      <CheckCircle className="w-4 h-4 text-secondary" />
                    </div>
                    <span className="text-foreground">{benefit}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative animate-scale-in">
              <Card className="p-8 bg-gradient-to-br from-primary/5 to-secondary/5 border-border/50 backdrop-blur-sm">
                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-gradient-primary rounded-lg">
                      <MessageSquare className="w-6 h-6 text-primary-foreground" />
                    </div>
                    <div>
                      <h4 className="font-semibold mb-1">24/7 AI Support</h4>
                      <p className="text-sm text-muted-foreground">
                        Get instant answers anytime, anywhere
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-gradient-secondary rounded-lg">
                      <TrendingUp className="w-6 h-6 text-secondary-foreground" />
                    </div>
                    <div>
                      <h4 className="font-semibold mb-1">Data-Driven Insights</h4>
                      <p className="text-sm text-muted-foreground">
                        Make decisions based on real admission trends
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-gradient-primary rounded-lg">
                      <GraduationCap className="w-6 h-6 text-primary-foreground" />
                    </div>
                    <div>
                      <h4 className="font-semibold mb-1">Personalized Guidance</h4>
                      <p className="text-sm text-muted-foreground">
                        Tailored recommendations for your profile
                      </p>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-hero relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-white/[0.05] bg-[size:20px_20px]" />
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl mx-auto text-center text-primary-foreground animate-fade-in">
            <h2 className="text-3xl md:text-5xl font-bold mb-6">
              Ready to Find Your Perfect College?
            </h2>
            <p className="text-lg mb-8 text-primary-foreground/90">
              Join thousands of students who have successfully navigated their college admission
              journey with Admit Genie.
            </p>
            <Link to="/register">
              <Button
                size="lg"
                variant="glass"
                className="bg-background/20 hover:bg-background/30 backdrop-blur-lg border-background/30"
              >
                Get Started for Free
                <ArrowRight className="w-5 h-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-border/50">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <Bot className="w-6 h-6 text-primary" />
              <span className="font-bold text-lg">Admit Genie</span>
            </div>
            <p className="text-sm text-muted-foreground text-center">
              © 2024 Admit Genie. All rights reserved. Made with AI for students.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
