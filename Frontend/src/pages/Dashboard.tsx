import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navigation from "@/components/Navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User, MessageSquare, TrendingUp, BookmarkIcon, Edit2, Save } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { authAPI, savedAPI, chatbotAPI, predictorAPI } from "@/lib/api";

const Dashboard = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState({
    name: "",
    email: "",
    cetRank: "",
    category: "",
    preferredCourses: "",
  });
  const [savedColleges, setSavedColleges] = useState<any[]>([]);
  const [chatHistory, setChatHistory] = useState<any[]>([]);
  const [predictions, setPredictions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    loadDashboardData();
  }, [isAuthenticated, navigate]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);

      // Load profile
      if (user) {
        setProfile({
          name: user.name || "",
          email: user.email || "",
          cetRank: user.cet_rank?.toString() || "",
          category: user.category || "General",
          preferredCourses: "",
        });

        // Load user profile from API
        try {
          const profileData = await authAPI.getProfile();
          if (profileData.user) {
            setProfile({
              name: profileData.user.name || "",
              email: profileData.user.email || "",
              cetRank: profileData.user.cet_rank?.toString() || "",
              category: profileData.user.category || "General",
              preferredCourses: "",
            });
          }
        } catch (error) {
          console.error("Failed to load profile:", error);
        }
      }

      // Load saved colleges
      try {
        const savedData = await savedAPI.getAll();
        setSavedColleges(savedData.saved || []);
      } catch (error) {
        console.error("Failed to load saved colleges:", error);
      }

      // Load chat history
      try {
        const chatData = await chatbotAPI.getHistory();
        setChatHistory(chatData.chats || []);
      } catch (error) {
        console.error("Failed to load chat history:", error);
      }

      // Load predictions
      try {
        const predData = await predictorAPI.getHistory();
        setPredictions(predData.predictions || []);
      } catch (error) {
        console.error("Failed to load predictions:", error);
      }
    } catch (error) {
      console.error("Failed to load dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    try {
      await authAPI.updateProfile({
        name: profile.name,
        email: profile.email,
        cet_rank: profile.cetRank ? parseInt(profile.cetRank) : undefined,
        category: profile.category,
      });
      setIsEditing(false);
      toast.success("Profile updated successfully!");
      loadDashboardData();
    } catch (error: any) {
      toast.error(error.message || "Failed to update profile");
    }
  };

  const handleRemoveSaved = async (id: number) => {
    try {
      await savedAPI.remove(id);
      toast.success("College removed from saved list");
      loadDashboardData();
    } catch (error: any) {
      toast.error(error.message || "Failed to remove college");
    }
  };

  const getProbabilityColor = (probability: string) => {
    switch (probability) {
      case "Safe":
        return "bg-green-500/20 text-green-700 dark:text-green-400";
      case "Moderate":
        return "bg-yellow-500/20 text-yellow-700 dark:text-yellow-400";
      case "Reach":
        return "bg-red-500/20 text-red-700 dark:text-red-400";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch {
      return dateString;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-4 pt-24 pb-12">
          <div className="text-center">Loading dashboard...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="container mx-auto px-4 pt-24 pb-12">
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent mb-2">
            My Dashboard
          </h1>
          <p className="text-muted-foreground">
            Manage your profile, view saved colleges, and track your admission journey
          </p>
        </div>

        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-8">
            <TabsTrigger value="profile" className="flex items-center gap-2">
              <User className="w-4 h-4" />
              <span className="hidden sm:inline">Profile</span>
            </TabsTrigger>
            <TabsTrigger value="saved" className="flex items-center gap-2">
              <BookmarkIcon className="w-4 h-4" />
              <span className="hidden sm:inline">Saved</span>
            </TabsTrigger>
            <TabsTrigger value="chats" className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4" />
              <span className="hidden sm:inline">Chats</span>
            </TabsTrigger>
            <TabsTrigger value="predictions" className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              <span className="hidden sm:inline">Predictions</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <Avatar className="w-20 h-20">
                      <AvatarImage src="" />
                      <AvatarFallback className="bg-gradient-primary text-primary-foreground text-2xl">
                        {profile.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")
                          .toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <CardTitle>{profile.name || "User"}</CardTitle>
                      <CardDescription>{profile.email}</CardDescription>
                    </div>
                  </div>
                  {!isEditing ? (
                    <Button variant="outline" onClick={() => setIsEditing(true)}>
                      <Edit2 className="w-4 h-4 mr-2" />
                      Edit Profile
                    </Button>
                  ) : (
                    <Button onClick={handleSaveProfile}>
                      <Save className="w-4 h-4 mr-2" />
                      Save Changes
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      value={profile.name}
                      onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                      disabled={!isEditing}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={profile.email}
                      onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                      disabled={!isEditing}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cetRank">CET Rank</Label>
                    <Input
                      id="cetRank"
                      value={profile.cetRank}
                      onChange={(e) => setProfile({ ...profile, cetRank: e.target.value })}
                      disabled={!isEditing}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="category">Category</Label>
                    <Input
                      id="category"
                      value={profile.category}
                      onChange={(e) => setProfile({ ...profile, category: e.target.value })}
                      disabled={!isEditing}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="saved" className="space-y-4">
            {savedColleges.length === 0 ? (
              <Card>
                <CardContent className="pt-6 text-center text-muted-foreground">
                  No saved colleges yet. Save colleges from predictions to see them here.
                </CardContent>
              </Card>
            ) : (
              savedColleges.map((college) => (
                <Card key={college.id} className="hover:shadow-glow transition-shadow duration-300">
                  <CardContent className="pt-6">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                      <div className="flex-1">
                        <h3 className="text-xl font-semibold mb-2">{college.college_name}</h3>
                        <p className="text-muted-foreground mb-3">{college.course_name || "N/A"}</p>
                        <div className="flex items-center gap-3">
                          {college.location && (
                            <span className="text-sm text-muted-foreground">
                              {college.location}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline">View Details</Button>
                        <Button
                          variant="destructive"
                          onClick={() => handleRemoveSaved(college.id)}
                        >
                          Remove
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          <TabsContent value="chats" className="space-y-4">
            {chatHistory.length === 0 ? (
              <Card>
                <CardContent className="pt-6 text-center text-muted-foreground">
                  No chat history yet. Start chatting to see your conversations here.
                </CardContent>
              </Card>
            ) : (
              chatHistory.map((chat) => (
                <Card key={chat.id} className="hover:shadow-glow transition-shadow duration-300">
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <p className="font-medium mb-2">{chat.query}</p>
                        <p className="text-sm text-muted-foreground">
                          {formatDate(chat.timestamp)}
                        </p>
                      </div>
                      <Button variant="outline" size="sm">
                        View Chat
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          <TabsContent value="predictions" className="space-y-4">
            {predictions.length === 0 ? (
              <Card>
                <CardContent className="pt-6 text-center text-muted-foreground">
                  No predictions yet. Use the Rank Predictor to get college predictions.
                </CardContent>
              </Card>
            ) : (
              predictions.map((prediction) => (
                <Card key={prediction.id} className="hover:shadow-glow transition-shadow duration-300">
                  <CardContent className="pt-6">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-4 mb-2">
                          <span className="text-lg font-semibold">Rank: {prediction.rank}</span>
                          <Badge variant="outline">{prediction.category}</Badge>
                        </div>
                        <p className="text-muted-foreground">
                          {prediction.results?.length || 0} colleges predicted •{" "}
                          {formatDate(prediction.created_at)}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline">View Results</Button>
                        <Button variant="secondary">Download</Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Dashboard;
