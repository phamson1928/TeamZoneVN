import { motion } from 'framer-motion';
import type { Variants } from 'framer-motion';
import type { ReactNode } from 'react';

const pageVariants: Variants = {
    initial: { opacity: 0, y: 12, scale: 0.995, filter: 'blur(4px)' },
    animate: { 
        opacity: 1, 
        y: 0, 
        scale: 1,
        filter: 'blur(0px)',
        transition: { 
            type: 'spring', 
            stiffness: 300, 
            damping: 30, 
            mass: 0.8 
        }
    },
    exit: { 
        opacity: 0, 
        y: -10, 
        scale: 0.995,
        filter: 'blur(4px)',
        transition: { duration: 0.2, ease: 'easeIn' }
    }
};

export const PageTransition = ({ children, className = "" }: { children: ReactNode, className?: string }) => {
    return (
        <motion.div
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className={className}
        >
            {children}
        </motion.div>
    );
};

export const StaggerContainer = ({ children, className = "", delayOrder = 0.08 }: { children: ReactNode, className?: string, delayOrder?: number }) => {
    return (
        <motion.div
            initial="hidden"
            animate="visible"
            variants={{
                hidden: { opacity: 0 },
                visible: {
                    opacity: 1,
                    transition: {
                        staggerChildren: delayOrder,
                        delayChildren: 0.1
                    }
                }
            }}
            className={className}
        >
            {children}
        </motion.div>
    );
};

export const StaggerItem = ({ children, className = "" }: { children: ReactNode, className?: string }) => {
    return (
        <motion.div
            variants={{
                hidden: { opacity: 0, y: 20, scale: 0.96 },
                visible: { 
                    opacity: 1, 
                    y: 0, 
                    scale: 1,
                    transition: { type: 'spring', stiffness: 350, damping: 25 }
                }
            }}
            className={className}
        >
            {children}
        </motion.div>
    );
};

export const AnimatedCard = ({ children, className = "" }: { children: ReactNode, className?: string }) => {
    return (
        <motion.div
            variants={{
                hidden: { opacity: 0, y: 20, scale: 0.96 },
                visible: { 
                    opacity: 1, 
                    y: 0, 
                    scale: 1,
                    transition: { type: 'spring', stiffness: 350, damping: 25 }
                }
            }}
            whileHover={{ 
                scale: 1.02, 
                y: -6, 
                transition: { type: 'spring', stiffness: 400, damping: 25 } 
            }}
            className={className}
        >
            {children}
        </motion.div>
    );
};
