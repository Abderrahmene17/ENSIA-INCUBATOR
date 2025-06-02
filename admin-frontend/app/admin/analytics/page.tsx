"use client"

import { useEffect, useState, useRef } from "react"
import { Search, Download } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import DashboardSidebar from "@/components/dashboard/dashboard-sidebar"
import DashboardHeader from "@/components/dashboard/dashboard-header"
import AnalyticsOverview from "@/components/dashboard/analytics-overview"
import SurvivalRateCard from "@/components/dashboard/survival-rate-card"
import AcceptanceRateCard from "@/components/dashboard/acceptance-rate-card"
import ResourceUtilization from "@/components/dashboard/resource-utilization"
import { useDashboardStats } from "@/hooks/useAnalytics"
import { jsPDF } from "jspdf"
import html2canvas from "html2canvas"
import { toast } from "@/components/ui/use-toast"

export default function AnalyticsPage() {
  const { stats, loading, error, fetchStats } = useDashboardStats()
  const [timePeriod, setTimePeriod] = useState("last30")
  const [isExporting, setIsExporting] = useState(false)
  const reportRef = useRef(null)

  useEffect(() => {
    fetchStats()
  }, [fetchStats])

  // Function to get time period label for the report
  const getTimePeriodLabel = () => {
    switch (timePeriod) {
      case "last30":
        return "Last 30 Days";
      case "last90":
        return "Last 90 Days";
      case "last6months":
        return "Last 6 Months";
      case "lastyear":
        return "Last Year";
      case "alltime":
        return "All Time";
      default:
        return "Last 30 Days";
    }
  }

  // Function to export analytics as PDF
  const exportReport = async () => {
    if (!reportRef.current) return;

    try {
      setIsExporting(true);
      toast({
        title: "Preparing report",
        description: "Please wait while we generate your PDF...",
      });

      // Create a new jsPDF instance
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      // Add title and date to the PDF
      const title = "ENSIA Incubator Analytics Report";
      const subtitle = `${getTimePeriodLabel()} - Generated on ${new Date().toLocaleDateString()}`;
      
      pdf.setFontSize(20);
      pdf.setTextColor(44, 62, 80);
      pdf.text(title, 20, 20);
      
      pdf.setFontSize(12);
      pdf.setTextColor(100, 100, 100);
      pdf.text(subtitle, 20, 30);

      // Add a horizontal line
      pdf.setDrawColor(200, 200, 200);
      pdf.line(20, 35, 190, 35);

      // Capture each section of the report separately for better quality
      const sections = reportRef.current.querySelectorAll('.report-section');
      let yPosition = 40;

      for (let i = 0; i < sections.length; i++) {
        const section = sections[i];
        const canvas = await html2canvas(section, {
          scale: 2,
          logging: false,
          useCORS: true,
          allowTaint: true,
        });
        
        const imgData = canvas.toDataURL('image/png');
        const imgWidth = 170;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        
        // Add a new page if the content would overflow
        if (yPosition + imgHeight > 280) {
          pdf.addPage();
          yPosition = 20;
        }
        
        // Add section title if available
        const sectionTitle = section.getAttribute('data-title');
        if (sectionTitle) {
          pdf.setFontSize(14);
          pdf.setTextColor(44, 62, 80);
          pdf.text(sectionTitle, 20, yPosition);
          yPosition += 8;
        }
        
        pdf.addImage(imgData, 'PNG', 20, yPosition, imgWidth, imgHeight);
        yPosition += imgHeight + 15;
      }

      // Save the PDF
      pdf.save(`ensia_incubator_analytics_${timePeriod}_${new Date().toISOString().split('T')[0]}.pdf`);
      
      toast({
        title: "Report exported successfully",
        description: "Your PDF has been downloaded.",
        variant: "success",
      });
    } catch (error) {
      console.error("Error exporting report:", error);
      toast({
        title: "Export failed",
        description: "There was an error generating your report. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="flex h-screen">
      <DashboardSidebar />
      <div className="flex flex-1 flex-col">
        <DashboardHeader />
        <main className="flex-1 overflow-auto">
          <div className="container mx-auto p-6">
            <div className="mb-8">
              <h1 className="text-3xl font-bold mb-6">Analytics</h1>

              <div className="flex items-center justify-between mb-6">
                <div className="relative w-full max-w-md">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input placeholder="Search analytics..." className="pl-9" />
                </div>
                <div className="flex items-center gap-2">
                  <Select 
                    defaultValue="last30"
                    onValueChange={(value) => setTimePeriod(value)}
                  >
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Time Period" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="last30">Last 30 Days</SelectItem>
                      <SelectItem value="last90">Last 90 Days</SelectItem>
                      <SelectItem value="last6months">Last 6 Months</SelectItem>
                      <SelectItem value="lastyear">Last Year</SelectItem>
                      <SelectItem value="alltime">All Time</SelectItem>
                    </SelectContent>
                  </Select>

                  <Button 
                    variant="outline" 
                    onClick={exportReport}
                    disabled={isExporting}
                    className="flex items-center gap-2"
                  >
                    {isExporting ? (
                      <>
                        <span className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full"></span>
                        Exporting...
                      </>
                    ) : (
                      <>
                        <Download className="h-4 w-4" />
                        Export Report
                      </>
                    )}
                  </Button>
                </div>
              </div>

              {/* Report content - wrapped in a div with ref for PDF export */}
              <div ref={reportRef}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 report-section" data-title="Key Metrics">
                  <SurvivalRateCard />
                  <AcceptanceRateCard />
                </div>

                <div className="mb-8 report-section" data-title="Analytics Overview">
                  <AnalyticsOverview />
                </div>

                <div className="mb-8 report-section" data-title="Resource Utilization">
                  <ResourceUtilization />
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}