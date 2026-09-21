'use client';

import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { CustomEase } from 'gsap/CustomEase';
import { Flip } from 'gsap/Flip';

// Since we cannot use paid GSAP Club plugins (like SplitText, DrawSVG, Inertia, MotionPath) via npm in this environment, 
// we will only register the public core plugins here, and mock the rest with standard GSAP tweens where necessary.
gsap.registerPlugin(useGSAP, CustomEase, Flip);

CustomEase.create('soft', '0.22, 1, 0.36, 1');
gsap.defaults({ ease: 'soft', duration: 0.6 });

export { gsap, useGSAP, CustomEase, Flip };
