import React from 'react';
import {
  Zap, Wrench, Snowflake, Smartphone, Laptop, Cpu, Hammer, Lightbulb,
  Utensils, ShoppingBag, Shirt, Footprints, Sparkles, Scissors, PenTool,
  Car, Bike, Droplet, Paintbrush, Building, Brush, ShieldAlert,
  Tv, Camera, Wifi, Code, Palette, Printer, Video, Truck, Plane,
  GraduationCap, PartyPopper, Armchair, Activity, MoreHorizontal,
  Home, CheckCircle2, Shield
} from 'lucide-react';

interface CategoryIconProps {
  name: string;
  className?: string;
}

export const CategoryIcon: React.FC<CategoryIconProps> = ({ name, className = 'w-5 h-5' }) => {
  switch (name) {
    case 'Zap': return <Zap className={className} />;
    case 'Wrench': return <Wrench className={className} />;
    case 'Snowflake': return <Snowflake className={className} />;
    case 'Smartphone': return <Smartphone className={className} />;
    case 'Laptop': return <Laptop className={className} />;
    case 'Cpu': return <Cpu className={className} />;
    case 'Hammer': return <Hammer className={className} />;
    case 'Lightbulb': return <Lightbulb className={className} />;
    case 'Utensils': return <Utensils className={className} />;
    case 'ShoppingBag': return <ShoppingBag className={className} />;
    case 'Shirt': return <Shirt className={className} />;
    case 'Footprints': return <Footprints className={className} />;
    case 'Sparkles': return <Sparkles className={className} />;
    case 'Scissors': return <Scissors className={className} />;
    case 'PenTool': return <PenTool className={className} />;
    case 'Car': return <Car className={className} />;
    case 'Bike': return <Bike className={className} />;
    case 'Droplet': return <Droplet className={className} />;
    case 'Paintbrush': return <Paintbrush className={className} />;
    case 'Building': return <Building className={className} />;
    case 'Brush': return <Brush className={className} />;
    case 'ShieldAlert': return <ShieldAlert className={className} />;
    case 'Tv': return <Tv className={className} />;
    case 'Camera': return <Camera className={className} />;
    case 'Wifi': return <Wifi className={className} />;
    case 'Code': return <Code className={className} />;
    case 'Palette': return <Palette className={className} />;
    case 'Printer': return <Printer className={className} />;
    case 'Video': return <Video className={className} />;
    case 'Truck': return <Truck className={className} />;
    case 'Plane': return <Plane className={className} />;
    case 'GraduationCap': return <GraduationCap className={className} />;
    case 'PartyPopper': return <PartyPopper className={className} />;
    case 'Armchair': return <Armchair className={className} />;
    case 'Activity': return <Activity className={className} />;
    case 'CheckCircle2': return <CheckCircle2 className={className} />;
    case 'Shield': return <Shield className={className} />;
    default: return <MoreHorizontal className={className} />;
  }
};
