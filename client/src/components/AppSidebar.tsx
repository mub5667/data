import { Database, FileSpreadsheet, Receipt, DollarSign, FileText, Award, UserPlus, LayoutDashboard, Menu, ChevronLeft, Building2, LogOut, Calendar, Globe, Wallet, Wrench, ClipboardList, Plane, Gift, BadgeCheck, ArrowLeftRight, Send, University, FilePlus2, Users, CheckCircle2, XCircle, FileSymlink, FileBarChart2 } from "lucide-react";
import { Link, useLocation } from "wouter";
import { useState } from "react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";

const datasets = [
  { title: "Dashboard", url: "/", icon: LayoutDashboard },
  { 
    title: "ABEER", 
    url: "/abeer", 
    icon: Database,
    submenu: [
     
      { title: "Income & Outcome", url: "/income-outcome", icon: Wallet },
      { title: "Events", url: "/abeer/events", icon: Calendar },
      { title: "Salaries", url: "/abeer/salaries", icon: Wallet },
      { title: "Service", url: "/abeer/service", icon: Wrench },
      { title: "Procedure of Receiving Student", url: "/abeer/procedure-receiving-student", icon: ClipboardList },
      { title: "Office", url: "/abeer/office", icon: Building2 },
      { title: "Trip/Travel/Bonus", url: "/abeer/trip-travel-bonus", icon: Plane },
      { title: "Employee Visa", url: "/abeer/employee-visa", icon: BadgeCheck },
      { title: "Money Transfer", url: "/abeer/money-transfer", icon: ArrowLeftRight },
    ]
  },

  { 
    title: "COMMISSION", 
    url: "/commission", 
    icon: DollarSign,
    submenu: [
      { title: "Commissions", url: "/commission", icon: DollarSign },
      { title: "Reports", url: "/commission/reports", icon: FileBarChart2 },
    ]
  },
  { 
    title: "INVOICES", 
    url: "/invoices", 
    icon: Receipt,
    submenu: [
      { title: "Invoices", url: "/invoices", icon: Receipt },
      { title: "Sent", url: "/invoices/sent", icon: Send },
      { title: "UCSI", url: "/invoices/ucsi", icon: University },
      { title: "UCSI Invoices", url: "/invoices/ucsi-invoices", icon: Receipt },
    ]
  },
  { 
    title: "ADV BILLS", 
    url: "/adv-bills", 
    icon: FileText,
    submenu: [
      { title: "ADV Bills", url: "/adv-bills", icon: FileText },
      { title: "Subagent", url: "/adv-bills/subagent", icon: Users },
    ]
  },
  { 
    title: "BONUS", 
    url: "/bonus", 
    icon: Award,
    submenu: [
      { title: "Add Bonus", url: "/bonus/add", icon: FilePlus2 },
      { title: "Agents", url: "/bonus/agents", icon: Users },
      { title: "Claimed", url: "/bonus/claimed", icon: CheckCircle2 },
      { title: "Not Claimed", url: "/bonus/not-claimed", icon: XCircle },
    ]
  },
  { 
    title: "Registration", 
    url: "/registration", 
    icon: UserPlus,
    submenu: [
      { title: "Add Student", url: "/registration/add-student", icon: UserPlus },
      { title: "Val Approved", url: "/registration/val-approved", icon: CheckCircle2 },
      { title: "Enrollment", url: "/registration/enrollment", icon: FileSymlink },
      { title: "Visa Process", url: "/registration/visa-process", icon: BadgeCheck },
      { title: "Not Submitted", url: "/registration/not-submitted", icon: XCircle },
      { title: "Cancelled", url: "/registration/cancelled", icon: XCircle },
    ]
  },
];

export function AppSidebar() {
  const [location] = useLocation();
  const [isOpen, setIsOpen] = useState(true);
  const [isHovered, setIsHovered] = useState(false);

  const handleLogout = () => {
    // Add your logout logic here
    console.log("Logging out...");
    // Example: clear auth tokens, redirect to login, etc.
  };

  return (
    <Sidebar 
      className={cn(
        "border-r bg-gradient-to-b from-white to-slate-50/80 backdrop-blur-sm",
        "transition-all duration-300 ease-in-out relative",
        "max-sm:fixed max-sm:z-40 max-sm:h-screen max-sm:top-0",
        isOpen ? "w-64" : "w-20",
        isHovered && !isOpen && "w-64 shadow-xl"
      )}
      onMouseEnter={() => !isOpen && setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(59,130,246,0.03)_25%,rgba(59,130,246,0.03)_50%,transparent_50%,transparent_75%,rgba(59,130,246,0.03)_75%)] bg-[length:8px_8px] opacity-20" />
      
      <SidebarContent className="py-4 relative z-10">
        {/* Header Section */}
        <div className={cn(
          "flex items-center gap-3 px-4 mb-6 transition-all duration-300",
          (!isOpen && !isHovered) && "justify-center px-2"
        )}>
          <div className={cn(
            "flex items-center gap-3 transition-all duration-300",
            (!isOpen && !isHovered) && "justify-center"
          )}>
            <div className={cn(
              "p-2 rounded-xl bg-gradient-to-br from-blue-600 to-blue-700 shadow-lg",
              "transition-transform duration-300 hover:scale-105"
            )}>
              <Building2 className="h-6 w-6 text-white" />
            </div>
            {(isOpen || isHovered) && (
              <div className="flex flex-col">
                <span className="font-bold text-lg bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
                  DataManager
                </span>
                <span className="text-xs text-slate-500 font-medium">Professional Suite</span>
              </div>
            )}
          </div>
        </div>

        {/* Toggle Button */}
        <div className={cn(
          "absolute -right-3 top-20 z-20 transition-all duration-300 max-sm:hidden",
          isOpen ? "right-3" : "right-4"
        )}>
          <button
            onClick={() => setIsOpen(!isOpen)}
            className={cn(
              "p-2 rounded-full border bg-white shadow-lg hover:shadow-xl",
              "transition-all duration-300 hover:scale-110 hover:bg-blue-50",
              "group border-slate-200"
            )}
            aria-label={isOpen ? "Collapse sidebar" : "Expand sidebar"}
          >
            <ChevronLeft className={cn(
              "h-4 w-4 text-slate-600 transition-transform duration-300",
              !isOpen && "rotate-180",
              "group-hover:text-blue-600"
            )} />
          </button>
        </div>

        {/* Navigation Menu */}
        <SidebarGroup className="flex-1">
          <SidebarGroupContent>
            <SidebarMenu className={cn("space-y-1", isOpen ? "px-3" : "px-2")}>
              {datasets.map((item) => {
                const isActive = location === item.url || (item.submenu && item.submenu.some(subItem => location === subItem.url));
                const showContent = isOpen || isHovered;
                const [submenuOpen, setSubmenuOpen] = useState(false);
                
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton 
                      asChild 
                      isActive={isActive}
                      className={cn(
                        "group relative transition-all duration-200 mb-1",
                        "hover:shadow-md hover:scale-[1.02]",
                        isActive 
                          ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg" 
                          : "text-slate-700 hover:bg-white hover:border hover:border-slate-200",
                        showContent ? "rounded-xl" : "rounded-full mx-auto w-12",
                        "border border-transparent"
                      )}
                      onClick={() => item.submenu && setSubmenuOpen(!submenuOpen)}
                    >
                      <Link 
                        href={item.url} 
                        data-testid={`link-${item.url.slice(1) || 'dashboard'}`}
                        title={!showContent ? item.title : undefined}
                        className="block"
                        onClick={(e) => item.submenu && e.preventDefault()}
                      >
                        <div className={cn(
                          "flex items-center w-full transition-all duration-200",
                          showContent ? "pl-4 pr-3 py-3" : "justify-center p-3"
                        )}>
                          <div className={cn(
                            "relative transition-transform duration-200 group-hover:scale-110",
                            isActive ? "text-white" : "text-slate-600 group-hover:text-blue-600"
                          )}>
                            <item.icon className="h-5 w-5 flex-shrink-0" />
                          </div>
                          
                          {showContent && (
                            <div className="flex items-center justify-between flex-1 ml-3">
                              <span className={cn(
                                "font-semibold text-sm transition-colors duration-200",
                                isActive ? "text-white" : "text-slate-700 group-hover:text-slate-900"
                              )}>
                                {item.title}
                              </span>
                              {item.submenu && (
                                <ChevronLeft className={cn(
                                  "h-4 w-4 transition-transform duration-300",
                                  submenuOpen ? "rotate-90" : "-rotate-90",
                                  isActive ? "text-white" : "text-slate-500"
                                )} />
                              )}
                            </div>
                          )}
                        </div>

                        {/* Active indicator */}
                        {isActive && showContent && (
                          <div className="absolute left-2 top-1/2 transform -translate-y-1/2 w-1 h-6 bg-white/40 rounded-full" />
                        )}

                        {/* Hover effect */}
                        {!isActive && (
                          <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-transparent via-white/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10" />
                        )}
                      </Link>
                    </SidebarMenuButton>
                    
                    {/* Submenu Items */}
                    {item.submenu && submenuOpen && showContent && (
                      <div className="ml-6 mt-1 space-y-1">
                        {item.submenu.map((subItem) => {
                          const isSubActive = location === subItem.url;
                          
                          return (
                            <Link 
                              key={subItem.title}
                              href={subItem.url}
                              className={cn(
                                "block px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200",
                                isSubActive 
                                  ? "bg-blue-100 text-blue-700" 
                                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                              )}
                            >
                              <span className="inline-flex items-center gap-2">
                                {subItem.icon && <subItem.icon className="h-4 w-4" />}
                                <span>{subItem.title}</span>
                              </span>
                            </Link>
                          );
                        })}
                      </div>
                    )}
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Logout Section */}
        <div className={cn(
          "px-4 pt-6 border-t border-slate-200/60",
          (!isOpen && !isHovered) && "px-2"
        )}>
          <button
            onClick={handleLogout}
            className={cn(
              "group flex items-center w-full transition-all duration-200",
              "hover:shadow-md hover:scale-[1.02] text-slate-700 hover:bg-red-50 hover:text-red-700",
              "border border-transparent hover:border-red-200",
              isOpen || isHovered ? "rounded-xl pl-4 pr-3 py-3" : "rounded-full p-3 justify-center"
            )}
          >
            <div className={cn(
              "transition-transform duration-200 group-hover:scale-110",
              "group-hover:text-red-600"
            )}>
              <LogOut className="h-5 w-5 flex-shrink-0" />
            </div>
            
            {(isOpen || isHovered) && (
              <div className="flex items-center justify-between flex-1 ml-3">
                <span className="font-semibold text-sm transition-colors duration-200">
                  Logout
                </span>
              </div>
            )}
          </button>
        </div>
      </SidebarContent>

      {/* Subtle glow effect */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-blue-500/20 to-transparent" />
      </div>
    </Sidebar>
  );
}