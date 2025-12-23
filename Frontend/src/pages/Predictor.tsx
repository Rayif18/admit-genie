import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { GraduationCap, TrendingUp, CheckCircle, AlertCircle, Sparkles, Loader2 } from "lucide-react";
import Navigation from "@/components/Navigation";
import { Progress } from "@/components/ui/progress";
import { predictorAPI, type Prediction, type CourseOption } from "@/lib/api";
import { toast } from "sonner";

// Types are now imported from api.ts
interface PredictionWithSelection extends Prediction {
  selectedCourseId?: number | null;
}

const Predictor = () => {
  const [rank, setRank] = useState("");
  const [category, setCategory] = useState("");
  const [course, setCourse] = useState("");
  const [showResults, setShowResults] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<PredictionWithSelection[]>([]);
  const [changingCourse, setChangingCourse] = useState<Set<number>>(new Set());

  const handlePredict = async () => {
    if (!rank || !category) {
      toast.error("Please enter your rank and select a category");
      return;
    }

    const rankNum = parseInt(rank);
    if (isNaN(rankNum) || rankNum < 1) {
      toast.error("Please enter a valid rank (must be a positive number)");
      return;
    }

    // Validate maximum rank
    if (rankNum > 1000000) {
      toast.error("Please enter a valid rank (maximum 1,000,000)");
      return;
    }

    setIsLoading(true);
    setShowResults(false);

    try {
      // Map frontend category values to backend format
      const categoryMap: { [key: string]: string } = {
        general: "General",
        obc: "OBC",
        sc: "SC",
        st: "ST",
        ews: "EWS",
      };

      const backendCategory = categoryMap[category] || category;

      // Course is optional - pass undefined if empty
      const courseToSend = course && course.trim() !== "" ? course : undefined;

      const response = await predictorAPI.predict(
        rankNum,
        backendCategory,
        courseToSend
      );

      if (response.predictions && response.predictions.length > 0) {
        const normalizedResults: PredictionWithSelection[] = response.predictions.map((item: Prediction) => ({
          ...item,
          selectedCourseId: item.defaultCourseId || item.availableCourses?.[0]?.id || null,
        }));

        setResults(normalizedResults);
        setShowResults(true);
        toast.success(`Found ${response.predictions.length} college predictions!`);
      } else {
        const message = response.message || "No predictions found for your criteria. Try different values.";
        toast.info(message);
        setShowResults(false);
      }
    } catch (error: any) {
      console.error("Predictor error:", error);
      
      // Provide more user-friendly error messages
      let errorMessage = "Failed to get predictions";
      
      if (error.status === 400) {
        errorMessage = "Invalid input. Please check your rank and category.";
      } else if (error.status === 429) {
        errorMessage = "Too many requests. Please wait a moment and try again.";
      } else if (error.status >= 500) {
        errorMessage = "Server error. Please try again later.";
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      toast.error(errorMessage);
      setShowResults(false);
    } finally {
      setIsLoading(false);
    }
  };

  const getCategoryColor = (cat: string) => {
    const normalized = cat === "reach" ? "difficult" : cat;
    switch (normalized) {
      case "safe":
        return "text-green-500 bg-green-500/10 border-green-500/20";
      case "moderate":
        return "text-yellow-500 bg-yellow-500/10 border-yellow-500/20";
      case "difficult":
        return "text-orange-500 bg-orange-500/10 border-orange-500/20";
      default:
        return "";
    }
  };

  const getCategoryIcon = (cat: string) => {
    const normalized = cat === "reach" ? "difficult" : cat;
    switch (normalized) {
      case "safe":
        return <CheckCircle className="w-4 h-4" />;
      case "moderate":
        return <TrendingUp className="w-4 h-4" />;
      case "difficult":
        return <AlertCircle className="w-4 h-4" />;
      default:
        return null;
    }
  };

  const formatFees = (fees?: number | null) => {
    if (!fees && fees !== 0) return "N/A";
    return `₹${Number(fees).toLocaleString("en-IN")}/year`;
  };

  const handleCourseChange = (collegeId: number, courseId: number) => {
    // Add loading state
    setChangingCourse(prev => new Set(prev).add(collegeId));
    
    // Simulate slight delay for better UX (course data is already loaded)
    setTimeout(() => {
      setResults((prev) =>
        prev.map((college) =>
          college.college_id === collegeId
            ? { ...college, selectedCourseId: courseId }
            : college
        )
      );
      setChangingCourse(prev => {
        const next = new Set(prev);
        next.delete(collegeId);
        return next;
      });
    }, 150);
  };

  const getSelectedCourse = (college: PredictionWithSelection): CourseOption | undefined => {
    return (
      college.availableCourses.find((c) => c.id === college.selectedCourseId) ||
      college.availableCourses[0]
    );
  };

  const hasResults = useMemo(() => results.length > 0, [results]);

  const handleDownloadReport = () => {
    if (!results.length) {
      toast.error("No predictions to download");
      return;
    }

    // Generate CSV content
    const headers = ["College Name", "Location", "Course", "Category", "Admission Probability", "Last Year Cutoff", "Annual Fees"];
    const rows = results.map((college) => {
      const selectedCourse = getSelectedCourse(college);
      if (!selectedCourse) return null;
      
      return [
        college.college_name,
        college.location,
        selectedCourse.branch,
        selectedCourse.category.toUpperCase(),
        `${selectedCourse.admissionProbability}%`,
        selectedCourse.closing_rank ? `Rank ${selectedCourse.closing_rank}` : "N/A",
        formatFees(selectedCourse.fees_per_year)
      ];
    }).filter(row => row !== null);

    // Escape special characters in CSV
    const escapeCSV = (value: any): string => {
      if (value === null || value === undefined) return "";
      const str = String(value);
      // Replace quotes with double quotes and wrap in quotes if contains comma, quote, or newline
      if (str.includes(",") || str.includes('"') || str.includes("\n")) {
        return `"${str.replace(/"/g, '""')}"`;
      }
      return str;
    };

    const csvContent = [
      headers.map(escapeCSV).join(","),
      ...rows.map(row => row.map(escapeCSV).join(","))
    ].join("\n");

    // Create and download file
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `college-predictions-rank-${rank}-${category}-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast.success("Report downloaded successfully!");
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <div className="pt-24 pb-8 px-4 container mx-auto max-w-6xl">
        {/* Header */}
        <div className="text-center mb-8 animate-fade-in">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/10 border border-secondary/20 mb-4">
            <Sparkles className="w-4 h-4 text-secondary" />
            <span className="text-sm font-medium text-secondary">AI-Powered Predictions</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-2">College Rank Predictor</h1>
          <p className="text-muted-foreground">
            Find the best colleges based on your CET rank with data-driven insights
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Input Form */}
          <Card className="lg:col-span-1 p-6 bg-card/50 backdrop-blur-sm border-border/50 h-fit animate-fade-in">
            <div className="flex items-center gap-2 mb-6">
              <div className="p-2 bg-gradient-primary rounded-lg">
                <GraduationCap className="w-5 h-5 text-primary-foreground" />
              </div>
              <h2 className="text-xl font-semibold">Your Details</h2>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="rank">CET Rank</Label>
                <Input
                  id="rank"
                  type="number"
                  placeholder="Enter your rank"
                  value={rank}
                  onChange={(e) => setRank(e.target.value)}
                  className="mt-1"
                  disabled={isLoading}
                />
              </div>

              <div>
                <Label htmlFor="category">Category</Label>
                <Select value={category} onValueChange={setCategory} disabled={isLoading}>
                  <SelectTrigger id="category" className="mt-1">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="general">General</SelectItem>
                    <SelectItem value="obc">OBC</SelectItem>
                    <SelectItem value="sc">SC</SelectItem>
                    <SelectItem value="st">ST</SelectItem>
                    <SelectItem value="ews">EWS</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="course">Preferred Course (Optional)</Label>
                <Select value={course || "all"} onValueChange={(value) => setCourse(value === "all" ? "" : value)} disabled={isLoading}>
                  <SelectTrigger id="course" className="mt-1">
                    <SelectValue placeholder="Any course" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Any Course</SelectItem>
                    <SelectItem value="Computer Science">Computer Science</SelectItem>
                    <SelectItem value="Computer Science and Engineering">Computer Science and Engineering</SelectItem>
                    <SelectItem value="Computer Engineering">Computer Engineering</SelectItem>
                    <SelectItem value="Information Technology">Information Technology</SelectItem>
                    <SelectItem value="Electronics">Electronics</SelectItem>
                    <SelectItem value="Electronics and Communication">Electronics and Communication</SelectItem>
                    <SelectItem value="Mechanical">Mechanical</SelectItem>
                    <SelectItem value="Mechanical Engineering">Mechanical Engineering</SelectItem>
                    <SelectItem value="Civil">Civil</SelectItem>
                    <SelectItem value="Civil Engineering">Civil Engineering</SelectItem>
                    <SelectItem value="Electrical">Electrical</SelectItem>
                    <SelectItem value="Electrical and Electronics Engineering">Electrical and Electronics Engineering</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground mt-1">
                  Leave as "Any Course" to see all courses
                </p>
              </div>

              <Button
                onClick={handlePredict}
                disabled={!rank || !category || isLoading}
                className="w-full"
                variant="hero"
              >
                {isLoading ? "Predicting..." : "Predict Colleges"}
              </Button>
            </div>
          </Card>

          {/* Results */}
          <div className="lg:col-span-2">
            {!showResults && !isLoading && (
              <Card className="p-12 text-center bg-card/50 backdrop-blur-sm border-border/50 animate-fade-in">
                <div className="w-20 h-20 bg-gradient-primary rounded-full flex items-center justify-center mx-auto mb-4">
                  <GraduationCap className="w-10 h-10 text-primary-foreground" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Ready to Predict?</h3>
                <p className="text-muted-foreground">
                  Enter your details on the left to get personalized college predictions based on
                  your CET rank and preferences.
                </p>
              </Card>
            )}

            {isLoading && (
              <Card className="p-12 text-center bg-card/50 backdrop-blur-sm border-border/50 animate-pulse">
                <div className="w-20 h-20 bg-gradient-primary rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse-glow">
                  <Sparkles className="w-10 h-10 text-primary-foreground" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Analyzing Your Data...</h3>
                <p className="text-muted-foreground mb-4">
                  Our AI is processing historical cutoffs and predicting your best matches
                </p>
                <Progress value={66} className="w-64 mx-auto" />
              </Card>
            )}

            {showResults && !isLoading && hasResults && (
              <div className="space-y-4">
                <div className="flex items-center justify-between mb-4 animate-fade-in">
                  <h2 className="text-2xl font-bold">Your College Predictions</h2>
                  <Button variant="glass" onClick={handleDownloadReport}>
                    Download Report
                  </Button>
                </div>

                {results.map((college, index) => {
                  const selectedCourse = getSelectedCourse(college);
                  if (!selectedCourse) return null;

                  return (
                    <Card
                      key={`college-${college.college_id}-${index}`}
                      className="p-6 bg-card/50 backdrop-blur-sm border-border/50 hover:shadow-glow transition-all duration-300 animate-fade-in"
                      style={{ animationDelay: `${index * 0.1}s` }}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-lg font-semibold">{college.college_name}</h3>
                            <span
                              className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium border ${getCategoryColor(
                                selectedCourse.category
                              )}`}
                            >
                              {getCategoryIcon(selectedCourse.category)}
                              {(
                                selectedCourse.category === "reach"
                                  ? "DIFFICULT"
                                  : selectedCourse.category
                              ).toUpperCase()}
                            </span>
                          </div>

                          <p className="text-sm text-muted-foreground mb-3">{college.location}</p>

                          <div className="grid grid-cols-2 gap-4 mb-4">
                            <div>
                              <p className="text-xs text-muted-foreground">Select Course</p>
                              <Select
                                value={selectedCourse.id.toString()}
                                onValueChange={(value) => handleCourseChange(college.college_id, Number(value))}
                                disabled={college.availableCourses.length === 0 || changingCourse.has(college.college_id)}
                              >
                                <SelectTrigger className="mt-1">
                                  <SelectValue placeholder="Select course" />
                                  {changingCourse.has(college.college_id) && (
                                    <Loader2 className="w-4 h-4 animate-spin text-muted-foreground ml-2" />
                                  )}
                                </SelectTrigger>
                                <SelectContent>
                                  {college.availableCourses.map((courseOption) => (
                                    <SelectItem key={courseOption.id} value={courseOption.id.toString()}>
                                      {courseOption.branch}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground">Annual Fees</p>
                              <p className="text-sm font-medium">{formatFees(selectedCourse.fees_per_year)}</p>
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground">Last Year Cutoff</p>
                              <p className="text-sm font-medium">
                                {selectedCourse.closing_rank ? `Rank ${selectedCourse.closing_rank}` : "N/A"}
                              </p>
                            </div>
                          </div>

                          <div>
                            <div className="flex items-center justify-between mb-2">
                              <p className="text-xs text-muted-foreground">Admission Probability</p>
                              <p className="text-sm font-semibold">{selectedCourse.admissionProbability}%</p>
                            </div>
                            <Progress value={selectedCourse.admissionProbability} className="h-2" />
                          </div>
                        </div>

                        <Link to={`/colleges/${college.college_id}`}>
                          <Button variant="outline" size="sm">
                            View Details
                          </Button>
                        </Link>
                      </div>
                    </Card>
                  );
                })}
              </div>
            )}

            {showResults && !isLoading && results.length === 0 && (
              <Card className="p-12 text-center bg-card/50 backdrop-blur-sm border-border/50">
                <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                  <AlertCircle className="w-10 h-10 text-muted-foreground" />
                </div>
                <h3 className="text-xl font-semibold mb-2">No Predictions Found</h3>
                <p className="text-muted-foreground">
                  Try adjusting your rank, category, or course preference.
                </p>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Predictor;
