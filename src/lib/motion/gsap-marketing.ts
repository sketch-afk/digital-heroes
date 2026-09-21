'use client';

import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { CustomEase } from 'gsap/CustomEase';

gsap.registerPlugin(useGSAP, ScrollTrigger, CustomEase);

CustomEase.create('soft', '0.22, 1, 0.36, 1');
gsap.defaults({ ease: 'soft', duration: 0.6 });

export { gsap, useGSAP, ScrollTrigger, CustomEase };
