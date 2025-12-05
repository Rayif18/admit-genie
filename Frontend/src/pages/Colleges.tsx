import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  GraduationCap,
  MapPin,
  Award,
  Search,
  Loader2,
  ChevronDown,
  ChevronUp,
  ArrowRight,
  ExternalLink,
  Mail,
  Phone,
} from "lucide-react";
import Navigation from "@/components/Navigation";
import { collegesAPI } from "@/lib/api";

interface College {
  id: number;
  name: string;
  location: string;
  state?: string;
  city?: string;
  accreditation?: string;
  ranking?: number;
  description?: string;
  website?: string;
  contact_email?: string;
  contact_phone?: string;
  placement_info?: string;
}

const Colleges = () => {
  const [colleges, setColleges] = useState<College[]>([]);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [collegeDetails, setCollegeDetails] = useState<{ [key: number]: any }>({});
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    loadColleges();
  }, [page]);

  const loadColleges = async () => {
    try {
      setLoading(true);
      const response = await collegesAPI.getAll(searchTerm);
      if (response.colleges) {
        setColleges(response.colleges);
        setTotalPages(response.pagination?.pages || 1);
      }
    } catch (error) {
      console.error("Failed to load colleges:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    setPage(1);
    loadColleges();
  };

  const loadCollegeDetails = async (id: number) => {
    if (collegeDetails[id]) return; // Already loaded
    
    try {
      const response = await collegesAPI.getById(id);
      if (response.college) {
        setCollegeDetails(prev => ({ ...prev, [id]: response.college }));
      }
    } catch (error) {
      console.error("Failed to load college details:", error);
    }
  };

  const toggleExpand = (id: number) => {
    if (expandedId === id) {
      setExpandedId(null);
    } else {
      setExpandedId(id);
      loadCollegeDetails(id);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <div className="pt-24 pb-8 px-4 container mx-auto max-w-7xl">
        {/* Header */}
        <div className="text-center mb-8 animate-fade-in">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/10 border border-secondary/20 mb-4">
            <GraduationCap className="w-4 h-4 text-secondary" />
            <span className="text-sm font-medium text-secondary">Explore Colleges</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-2">Find Your Perfect College</h1>
          <p className="text-muted-foreground">
            Browse through our comprehensive database of colleges and universities
          </p>
        </div>

        {/* Search Bar */}
        <div className="max-w-2xl mx-auto mb-8">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
              <Input
                type="text"
                placeholder="Search colleges by name, location, or description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                className="pl-10"
              />
            </div>
            <Button onClick={handleSearch} disabled={loading}>
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Search"}
            </Button>
          </div>
        </div>

        {/* Colleges Grid */}
        {loading && colleges.length === 0 ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {colleges.map((college, index) => {
                const isExpanded = expandedId === college.id;
                const details = collegeDetails[college.id];
                
                return (
                  <Card
                    key={college.id}
                    className="bg-card/50 backdrop-blur-sm border-border/50 hover:shadow-glow transition-all duration-300 animate-fade-in overflow-hidden"
                    style={{ animationDelay: `${index * 0.05}s` }}
                  >
                    {/* Preview Section */}
                    <div className="p-6">
                      <div className="flex items-start justify-between gap-4 mb-3">
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold mb-2 line-clamp-2">
                            {college.name}
                          </h3>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                            <MapPin className="w-4 h-4" />
                            <span>{college.location}</span>
                          </div>
                        </div>
                        {college.ranking && (
                          <div className="flex items-center gap-1 px-2 py-1 bg-primary/10 rounded-full">
                            <Award className="w-4 h-4 text-primary" />
                            <span className="text-xs font-medium text-primary">
                              #{college.ranking}
                            </span>
                          </div>
                        )}
                      </div>

                      {college.accreditation && (
                        <p className="text-xs text-muted-foreground mb-3">
                          {college.accreditation}
                        </p>
                      )}

                      {college.description && (
                        <p className="text-sm text-muted-foreground line-clamp-3 mb-4">
                          {college.description}
                        </p>
                      )}

                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full"
                        onClick={() => toggleExpand(college.id)}
                      >
                        {isExpanded ? (
                          <>
                            Show Less
                            <ChevronUp className="w-4 h-4 ml-2" />
                          </>
                        ) : (
                          <>
                            View Details
                            <ChevronDown className="w-4 h-4 ml-2" />
                          </>
                        )}
                      </Button>
                    </div>

                    {/* Expanded Details Section */}
                    {isExpanded && (
                      <div className="border-t border-border/50 p-6 bg-muted/20 animate-fade-in">
                        {details ? (
                          <div className="space-y-4">
                            {details.description && (
                              <div>
                                <h4 className="font-semibold mb-2">About</h4>
                                <p className="text-sm text-muted-foreground">
                                  {details.description}
                                </p>
                              </div>
                            )}

                            {details.placement_info && (
                              <div>
                                <h4 className="font-semibold mb-2">Placements</h4>
                                <p className="text-sm text-muted-foreground">
                                  {details.placement_info}
                                </p>
                              </div>
                            )}

                            <div className="grid grid-cols-1 gap-3 pt-4 border-t border-border/50">
                              {details.website && (
                                <div className="flex items-center gap-2">
                                  <ExternalLink className="w-4 h-4 text-muted-foreground" />
                                  <a
                                    href={details.website}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-sm text-primary hover:underline"
                                  >
                                    Visit Website
                                  </a>
                                </div>
                              )}
                              {details.contact_email && (
                                <div className="flex items-center gap-2">
                                  <Mail className="w-4 h-4 text-muted-foreground" />
                                  <a
                                    href={`mailto:${details.contact_email}`}
                                    className="text-sm text-muted-foreground hover:text-primary"
                                  >
                                    {details.contact_email}
                                  </a>
                                </div>
                              )}
                              {details.contact_phone && (
                                <div className="flex items-center gap-2">
                                  <Phone className="w-4 h-4 text-muted-foreground" />
                                  <a
                                    href={`tel:${details.contact_phone}`}
                                    className="text-sm text-muted-foreground hover:text-primary"
                                  >
                                    {details.contact_phone}
                                  </a>
                                </div>
                              )}
                            </div>

                            {details.courses && details.courses.length > 0 && (
                              <div>
                                <h4 className="font-semibold mb-2">Available Courses</h4>
                                <div className="flex flex-wrap gap-2">
                                  {details.courses.slice(0, 3).map((course: any, idx: number) => (
                                    <span
                                      key={idx}
                                      className="px-2 py-1 bg-primary/10 text-primary text-xs rounded"
                                    >
                                      {course.course_name}
                                    </span>
                                  ))}
                                  {details.courses.length > 3 && (
                                    <span className="px-2 py-1 text-muted-foreground text-xs">
                                      +{details.courses.length - 3} more
                                    </span>
                                  )}
                                </div>
                              </div>
                            )}

                            <Link to={`/colleges/${college.id}`}>
                              <Button variant="default" className="w-full mt-4">
                                View Full Profile
                                <ArrowRight className="w-4 h-4 ml-2" />
                              </Button>
                            </Link>
                          </div>
                        ) : (
                          <div className="flex justify-center items-center py-8">
                            <Loader2 className="w-6 h-6 animate-spin text-primary" />
                          </div>
                        )}
                      </div>
                    )}
                  </Card>
                );
              })}
            </div>

            {colleges.length === 0 && !loading && (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No colleges found matching your search.</p>
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-2 mt-8">
                <Button
                  variant="outline"
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1 || loading}
                >
                  Previous
                </Button>
                <span className="text-sm text-muted-foreground">
                  Page {page} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages || loading}
                >
                  Next
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Colleges;

