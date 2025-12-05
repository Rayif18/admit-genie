import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  GraduationCap,
  MapPin,
  Award,
  Loader2,
  ArrowLeft,
  ExternalLink,
  Mail,
  Phone,
  Calendar,
  DollarSign,
  Users,
  BookOpen,
} from "lucide-react";
import Navigation from "@/components/Navigation";
import { collegesAPI } from "@/lib/api";
import { toast } from "sonner";

const CollegeDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [college, setCollege] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      loadCollegeDetails();
    }
  }, [id]);

  const loadCollegeDetails = async () => {
    try {
      setLoading(true);
      const response = await collegesAPI.getById(parseInt(id!));
      if (response.college) {
        setCollege(response.college);
      } else {
        toast.error("College not found");
        navigate("/colleges");
      }
    } catch (error: any) {
      console.error("Failed to load college details:", error);
      toast.error(error.message || "Failed to load college details");
      navigate("/colleges");
    } finally {
      setLoading(false);
    }
  };

  const formatFees = (fees: number) => {
    if (!fees) return "N/A";
    return `₹${fees.toLocaleString('en-IN')}/year`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="pt-24 pb-8 px-4 container mx-auto max-w-6xl">
          <div className="flex justify-center items-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        </div>
      </div>
    );
  }

  if (!college) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="pt-24 pb-8 px-4 container mx-auto max-w-6xl">
          <Card className="p-8 text-center">
            <h2 className="text-2xl font-bold mb-4">College Not Found</h2>
            <Link to="/colleges">
              <Button>Back to Colleges</Button>
            </Link>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <div className="pt-24 pb-8 px-4 container mx-auto max-w-6xl">
        {/* Back Button */}
        <Link to="/colleges">
          <Button variant="ghost" className="mb-6">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Colleges
          </Button>
        </Link>

        {/* College Header */}
        <Card className="p-8 mb-6 bg-card/50 backdrop-blur-sm border-border/50">
          <div className="flex items-start justify-between gap-6 mb-6">
            <div className="flex-1">
              <div className="flex items-center gap-4 mb-4">
                <h1 className="text-3xl md:text-4xl font-bold">{college.name}</h1>
                {college.ranking && (
                  <div className="flex items-center gap-2 px-3 py-1 bg-primary/10 rounded-full">
                    <Award className="w-5 h-5 text-primary" />
                    <span className="text-sm font-medium text-primary">
                      Rank #{college.ranking}
                    </span>
                  </div>
                )}
              </div>
              <div className="flex items-center gap-2 text-muted-foreground mb-4">
                <MapPin className="w-5 h-5" />
                <span className="text-lg">{college.location}</span>
                {college.state && <span>• {college.state}</span>}
              </div>
              {college.accreditation && (
                <p className="text-sm text-muted-foreground mb-4">
                  {college.accreditation}
                </p>
              )}
            </div>
          </div>

          {/* Contact Info */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-6 border-t border-border/50">
            {college.website && (
              <a
                href={college.website}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-primary hover:underline"
              >
                <ExternalLink className="w-4 h-4" />
                <span>Visit Website</span>
              </a>
            )}
            {college.contact_email && (
              <a
                href={`mailto:${college.contact_email}`}
                className="flex items-center gap-2 text-muted-foreground hover:text-primary"
              >
                <Mail className="w-4 h-4" />
                <span>{college.contact_email}</span>
              </a>
            )}
            {college.contact_phone && (
              <a
                href={`tel:${college.contact_phone}`}
                className="flex items-center gap-2 text-muted-foreground hover:text-primary"
              >
                <Phone className="w-4 h-4" />
                <span>{college.contact_phone}</span>
              </a>
            )}
          </div>
        </Card>

        {/* Description */}
        {college.description && (
          <Card className="p-6 mb-6 bg-card/50 backdrop-blur-sm border-border/50">
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
              <BookOpen className="w-6 h-6" />
              About
            </h2>
            <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
              {college.description}
            </p>
          </Card>
        )}

        {/* Placement Info */}
        {college.placement_info && (
          <Card className="p-6 mb-6 bg-card/50 backdrop-blur-sm border-border/50">
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
              <Users className="w-6 h-6" />
              Placements
            </h2>
            <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
              {college.placement_info}
            </p>
          </Card>
        )}

        {/* Courses */}
        {college.courses && college.courses.length > 0 && (
          <Card className="p-6 mb-6 bg-card/50 backdrop-blur-sm border-border/50">
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
              <GraduationCap className="w-6 h-6" />
              Available Courses
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {college.courses.map((course: any, index: number) => (
                <Card key={index} className="p-4 bg-muted/20 border-border/50">
                  <h3 className="font-semibold text-lg mb-2">{course.course_name}</h3>
                  {course.course_code && (
                    <p className="text-sm text-muted-foreground mb-2">
                      Code: {course.course_code}
                    </p>
                  )}
                  <div className="space-y-2 text-sm">
                    {course.duration && (
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-muted-foreground" />
                        <span>{course.duration}</span>
                      </div>
                    )}
                    {course.fees && (
                      <div className="flex items-center gap-2">
                        <DollarSign className="w-4 h-4 text-muted-foreground" />
                        <span>{formatFees(course.fees)}</span>
                      </div>
                    )}
                    {course.eligibility && (
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Eligibility:</p>
                        <p className="text-sm">{course.eligibility}</p>
                      </div>
                    )}
                    {course.description && (
                      <p className="text-sm text-muted-foreground mt-2">
                        {course.description}
                      </p>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          </Card>
        )}

        {/* Admissions */}
        {college.admissions && college.admissions.length > 0 && (
          <Card className="p-6 mb-6 bg-card/50 backdrop-blur-sm border-border/50">
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
              <Calendar className="w-6 h-6" />
              Admission Information
            </h2>
            <div className="space-y-4">
              {college.admissions.map((admission: any, index: number) => (
                <Card key={index} className="p-4 bg-muted/20 border-border/50">
                  {admission.required_exam && (
                    <p className="font-semibold mb-2">
                      Required Exam: {admission.required_exam}
                    </p>
                  )}
                  {admission.deadline && (
                    <p className="text-sm text-muted-foreground mb-2">
                      Deadline: {new Date(admission.deadline).toLocaleDateString()}
                    </p>
                  )}
                  {admission.admission_process && (
                    <div>
                      <p className="text-sm font-medium mb-1">Process:</p>
                      <p className="text-sm text-muted-foreground">
                        {admission.admission_process}
                      </p>
                    </div>
                  )}
                  {admission.application_link && (
                    <a
                      href={admission.application_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-primary hover:underline mt-2 inline-block"
                    >
                      Apply Now →
                    </a>
                  )}
                </Card>
              ))}
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};

export default CollegeDetail;

