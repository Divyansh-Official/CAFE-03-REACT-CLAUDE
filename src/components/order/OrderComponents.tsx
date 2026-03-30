import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import type { Order } from '../../types/order.types';
import { formatDateTime } from '../../utils/helpers';

// ─── OrderTimeline ────────────────────────────────────────────
interface TimelineProps {
  order: Partial<Order>;
}

const STEPS: {
  key: keyof Order;
  label: string;
  icon: string;
  status: Order['status'];
}[] = [
  { key: 'placedAt',           label: 'Order Placed',       icon: '📋', status: 'placed' },
  { key: 'preparingAt',        label: 'Being Prepared',      icon: '👨‍🍳', status: 'preparing' },
  { key: 'outForDeliveryAt',   label: 'Out for Delivery',    icon: '🛵', status: 'out_for_delivery' },
  { key: 'deliveredAt',        label: 'Delivered',           icon: '🎉', status: 'delivered' },
];

const STATUS_ORDER: Order['status'][] = ['placed', 'preparing', 'out_for_delivery', 'delivered'];

export const OrderTimeline: React.FC<TimelineProps> = ({ order }) => {
  const currentIdx = STATUS_ORDER.indexOf(order.status ?? 'placed');

  return (
    <div className="relative py-2">
      {STEPS.map((step, i) => {
        const isDone    = i < currentIdx;
        const isCurrent = i === currentIdx;
        const isPending = i > currentIdx;
        const timestamp = order[step.key] as string | undefined;

        return (
          <div key={step.key} className="flex gap-4 relative">
            {/* Vertical line */}
            {i < STEPS.length - 1 && (
              <div className="absolute left-[19px] top-10 w-0.5 h-10 z-0"
                style={{ background: isDone ? 'linear-gradient(135deg,#FF3B30,#FF9500,#FFD600)' : 'rgba(255,255,255,0.1)' }}
              />
            )}

            {/* Dot */}
            <div className="relative z-10 shrink-0">
              <motion.div
                className={`w-10 h-10 rounded-full flex items-center justify-center text-lg border-2 transition-all
                  ${isDone    ? 'bg-gradient-to-br from-primary to-warning border-primary' : ''}
                  ${isCurrent ? 'border-primary bg-primary/20 shadow-glow' : ''}
                  ${isPending ? 'border-white/20 bg-card' : ''}`}
                animate={isCurrent ? { scale: [1, 1.08, 1] } : { scale: 1 }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                {isDone ? '✓' : step.icon}
              </motion.div>
            </div>

            {/* Content */}
            <div className="pb-10 flex-1">
              <p className={`font-bold text-sm leading-tight ${isPending ? 'text-text-secondary' : 'text-white'}`}>
                {step.label}
              </p>
              {isCurrent && (
                <motion.p
                  className="text-primary text-xs font-semibold mt-0.5"
                  animate={{ opacity: [1, 0.5, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  In progress…
                </motion.p>
              )}
              {timestamp && (
                <p className="text-text-secondary text-xs mt-0.5">{formatDateTime(timestamp)}</p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

// ─── DeliveryMap ─────────────────────────────────────────────
interface DeliveryMapProps {
  cafeLat?: number;
  cafeLng?: number;
  customerLat?: number;
  customerLng?: number;
  height?: string;
}

export const DeliveryMap: React.FC<DeliveryMapProps> = ({
  cafeLat = 30.7333,
  cafeLng = 76.7794,
  customerLat,
  customerLng,
  height = '280px',
}) => {
  const mapRef  = useRef<HTMLDivElement>(null);
  const mapInst = useRef<unknown>(null);

  useEffect(() => {
    if (!mapRef.current || mapInst.current) return;

    // Dynamically import Leaflet to avoid SSR issues
    import('leaflet').then((L) => {
      import('leaflet/dist/leaflet.css');

      // Fix default icon paths
      delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        iconUrl:       'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        shadowUrl:     'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      });

      const map = L.map(mapRef.current!, {
        center: [cafeLat, cafeLng],
        zoom: customerLat ? 14 : 15,
        zoomControl: true,
        scrollWheelZoom: false,
      });

      L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        attribution: '© OpenStreetMap © CARTO',
        maxZoom: 19,
      }).addTo(map);

      // Cafe marker — brand red
      const cafeIcon = L.divIcon({
        className: '',
        html: `<div style="background:linear-gradient(135deg,#FF3B30,#FF9500);
                  width:36px;height:36px;border-radius:50% 50% 50% 0;transform:rotate(-45deg);
                  border:2px solid #fff;box-shadow:0 2px 8px rgba(255,59,48,.5);">
                 <span style="display:block;transform:rotate(45deg);text-align:center;font-size:16px;line-height:32px;">🫧</span>
               </div>`,
        iconSize: [36, 36],
        iconAnchor: [18, 36],
      });
      L.marker([cafeLat, cafeLng], { icon: cafeIcon })
        .addTo(map)
        .bindPopup('<b>Bobba Bobba & Hungroo</b><br>Shop No. 360, Sector 15D<br>Chandigarh');

      // Customer marker
      if (customerLat && customerLng) {
        const custIcon = L.divIcon({
          className: '',
          html: `<div style="background:#FFD600;width:30px;height:30px;border-radius:50%;
                   border:2px solid #fff;display:flex;align-items:center;justify-content:center;
                   font-size:14px;box-shadow:0 2px 8px rgba(0,0,0,.4);">📍</div>`,
          iconSize: [30, 30],
          iconAnchor: [15, 30],
        });
        L.marker([customerLat, customerLng], { icon: custIcon })
          .addTo(map)
          .bindPopup('<b>Your Location</b>');

        // Dashed polyline between cafe and customer
        L.polyline(
          [[cafeLat, cafeLng], [customerLat, customerLng]],
          { color: '#FF9500', weight: 2, dashArray: '6 6', opacity: 0.8 }
        ).addTo(map);

        const bounds = L.latLngBounds([[cafeLat, cafeLng], [customerLat, customerLng]]);
        map.fitBounds(bounds, { padding: [40, 40] });
      }

      mapInst.current = map;
    });

    return () => {
      if (mapInst.current) {
        (mapInst.current as { remove: () => void }).remove();
        mapInst.current = null;
      }
    };
  }, [cafeLat, cafeLng, customerLat, customerLng]);

  return (
    <div
      ref={mapRef}
      style={{ height, borderRadius: '1rem', overflow: 'hidden' }}
      className="w-full border border-white/10"
    />
  );
};

export default OrderTimeline;