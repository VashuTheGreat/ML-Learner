import { useState, useEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Code2, User as UserIcon, LogOut, LayoutDashboard, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import userApi from "@/services/userApi";

interface User {
  _id: string;
  fullName: string;
  email: string;
  avatar?: string;
}

const Navbar = () => {
  return null;
};
export default Navbar;
