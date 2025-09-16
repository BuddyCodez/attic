import Image from "next/image";
import Header from "~/components/reusables/header";
import { Badge } from "~/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card"
import { BookOpen, FileText, Quote, Search, Github, Twitter, Linkedin } from "lucide-react"
import { Button } from "~/components/ui/button";
export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      {/* Hero Section */}
      <HeroSection />
      {/* Featured Curios Section */}
      <FeaturedCurios />

    </div>
  );
}

const HeroSection = () => {
  return (
    <section className="relative  w-full flex items-center justify-center">
      {/* Background with grid pattern */}
      <div
        className="absolute inset-0 z-0"
        style={{
          backgroundColor: "transparent",
          backgroundImage: `
              linear-gradient(to right, rgba(107, 76, 76, 0.08) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(107, 76, 76, 0.08) 1px, transparent 1px)
            `,
          backgroundSize: "24px 24px",
          WebkitMaskImage:
            "radial-gradient(ellipse 80% 70% at 50% 20%, #000 40%, transparent 100%)",
          maskImage:
            "radial-gradient(ellipse 80% 70% at 50% 20%, #000 40%, transparent 100%)",
        }}
      />

      {/* Content */}
      <div className="relative py-16 z-10 container mx-auto px-4 text-center">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-7xl font-serif font-bold text-primary mb-8 text-balance leading-tight">
            Welcome to My Digital Attic
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground mb-12 text-pretty max-w-2xl mx-auto">
            A curated collection of my thoughts, reads, and discoveries.
          </p>
          <div className="flex items-center justify-center space-x-4 text-sm text-muted-foreground">
            <div className="w-12 h-px bg-border"></div>
            <span className="font-serif italic">Where I store my notes and curiosities</span>
            <div className="w-12 h-px bg-border"></div>
          </div>
        </div>
      </div>
      
    </section>
  );
};
{/* Featured Curios */ }
const FeaturedCurios = () => {
  return (
    <section className="py-16 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h3 className="text-3xl literary-heading font-bold text-primary mb-4 fade-in">Featured Curios</h3>
          <p className="literary-body text-muted-foreground max-w-2xl mx-auto slide-up stagger-1">
            The most interesting items I've recently placed in the attic
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {/* Latest Essay Card - Bigger with more content */}
          <Card className="paper-card hover-lift group p-2 slide-up stagger-1">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between mb-3">
                <FileText className="h-6 w-6 text-primary smooth-transition" />
                <Badge variant="secondary" className="text-xs literary-accent">
                  Latest Essay
                </Badge>
              </div>
              <CardTitle className="text-2xl literary-heading group-hover:text-primary smooth-transition mb-2">
                On Creative Block and the Art of Waiting
              </CardTitle>
              <div className="text-xs text-muted-foreground mb-3 literary-body">
                Published 3 days ago • 8 min read
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <CardDescription className="text-base leading-relaxed literary-body">
                Exploring the paradox of creativity and the moments when inspiration feels most distant. Sometimes the
                most productive thing we can do is nothing at all—learning to trust the process of creative
                germination and finding beauty in the pause between ideas.
              </CardDescription>
              <div className="flex flex-wrap gap-2 mb-4">
                <Badge variant="outline" className="text-xs literary-accent">
                  creativity
                </Badge>
                <Badge variant="outline" className="text-xs literary-accent">
                  writing
                </Badge>
                <Badge variant="outline" className="text-xs literary-accent">
                  process
                </Badge>
              </div>
              <Button
                variant="ghost"
                className="p-0 h-auto text-primary px-2 font-medium literary-accent smooth-transition"
              >
                Continue reading →
              </Button>
            </CardContent>
          </Card>

          {/* Currently Reading Card - Bigger with more content */}
          <Card className="paper-card hover-lift group p-2 slide-up stagger-2">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between mb-3">
                <BookOpen className="h-6 w-6 text-primary smooth-transition" />
                <Badge variant="secondary" className="text-xs literary-accent">
                  Reading Now
                </Badge>
              </div>
              <CardTitle className="text-2xl literary-heading group-hover:text-primary smooth-transition mb-2">
                The Psychology of Money
              </CardTitle>
              <div className="text-sm text-muted-foreground mb-3 literary-body">by Morgan Housel</div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-4 mb-4">
                <Image
                  src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/attachments/gen-images/public/book-cover-psychology-of-money-ZMsrULv4HJFqBSMYwHqn644eJ3rg8J.jpg"
                  alt="The Psychology of Money book cover"
                  width={100}
                  height={150}
                  className="rounded shadow-md flex-shrink-0 smooth-transition hover:scale-105"
                />
                <div className="flex-1 space-y-3">
                  <CardDescription className="text-sm leading-relaxed literary-body">
                    A fascinating exploration of how our emotions and psychology drive financial decisions. Housel's
                    insights about wealth, greed, and happiness are reshaping how I think about money.
                  </CardDescription>
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs text-muted-foreground literary-accent">
                      <span>Progress</span>
                      <span>Chapter 12 of 20</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-primary h-2 rounded-full progress-bar relative"
                        style={{ width: "65%" }}
                      ></div>
                    </div>
                    <div className="text-xs text-muted-foreground literary-body">
                      Started 2 weeks ago • 65% complete
                    </div>
                  </div>
                </div>
              </div>
              <Button
                variant="ghost"
                className="p-0 h-auto text-primary px-2 font-medium literary-accent smooth-transition"
              >
                View my notes →
              </Button>
            </CardContent>
          </Card>

          {/* Quote Card - Bigger with more content */}
          <Card className="paper-card hover-lift group p-2 slide-up stagger-3">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between mb-3">
                <Quote className="h-6 w-6 text-primary smooth-transition" />
                <Badge variant="secondary" className="text-xs literary-accent">
                  From the Jar
                </Badge>
              </div>
              <CardTitle className="text-xl literary-heading group-hover:text-primary smooth-transition mb-2">
                Today's Reflection
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <blockquote className="text-lg italic text-foreground leading-relaxed mb-4 border-l-4 border-primary/20 pl-4 literary-accent">
                "The best time to plant a tree was 20 years ago. The second best time is now."
              </blockquote>
              <cite className="text-sm text-muted-foreground block mb-4 literary-body">— Chinese Proverb</cite>
              <CardDescription className="text-sm leading-relaxed literary-body">
                A reminder that while we can't change the past, we always have the power to start something meaningful
                today. Perfect timing is a myth—the courage to begin is what matters.
              </CardDescription>
              <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t border-border literary-accent">
                <span>Added to collection</span>
                <span>Yesterday</span>
              </div>
            </CardContent>
          </Card>

          {/* Explore Collection Card - Bigger with more content */}
          <Card className="paper-card aged-paper hover-lift group border-primary/20 p-2 slide-up stagger-4">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between mb-3">
                <Search className="h-6 w-6 text-primary smooth-transition" />
                <Badge variant="default" className="text-xs literary-accent">
                  Explore
                </Badge>
              </div>
              <CardTitle className="text-2xl literary-heading group-hover:text-primary smooth-transition mb-2">
                Browse the Full Collection
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <CardDescription className="text-base leading-relaxed mb-4 literary-body">
                Dive into my complete digital attic—years of collected thoughts, book summaries, favorite quotes, and
                random discoveries that have shaped my thinking.
              </CardDescription>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground literary-body">Essays</span>
                  <span className="font-medium literary-accent">47</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground literary-body">Books</span>
                  <span className="font-medium literary-accent">23</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground literary-body">Quotes</span>
                  <span className="font-medium literary-accent">156</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground literary-body">Notes</span>
                  <span className="font-medium literary-accent">89</span>
                </div>
              </div>
              <Button className="w-full mt-4 literary-accent smooth-transition hover:scale-105" size="default">
                Start Exploring the Attic
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
};