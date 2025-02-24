import { Directive, ElementRef, OnDestroy, OnInit, Renderer2 } from '@angular/core';
import { Subject } from 'rxjs';
import { OpenposMediaService } from '../../core/media/openpos-media.service';
import { takeUntil, tap } from 'rxjs/operators';

@Directive({
    // tslint:disable-next-line: directive-selector
    selector: '[responsive-class]'
})
export class ResponsiveClassDirective implements OnInit, OnDestroy {
    destroyed$ = new Subject();
    breakpointNameToClasses = new Map<string, string[]>();

    constructor(
        private mediaService: OpenposMediaService,
        private renderer: Renderer2,
        private elementRef: ElementRef
    ) {
    }

    ngOnInit(): void {
        this.updateBreakpointNameToClassNames();
        this.watchBreakpointChanges();
        this.watchBreakpointConfigChanges();
    }

    ngOnDestroy(): void {
        this.destroyed$.next();
    }

    /**
     * Updates the active classes on the host element when the active breakpoint changes.
     */
    watchBreakpointChanges(): void {
        this.mediaService.observe(this.breakpointNameToClasses)
            .pipe(
                tap(classNames => this.updateClasses(classNames)),
                takeUntil(this.destroyed$)
            ).subscribe();
    }

    /**
     * Updates the available class names when the media service configuration changes.
     */
    watchBreakpointConfigChanges(): void {
        this.mediaService.configChanged$
            .pipe(
                tap(() => this.updateBreakpointNameToClassNames()),
                takeUntil(this.destroyed$)
            ).subscribe();
    }

    /**
     * Updates the map of breakpoint names to class names.
     */
    updateBreakpointNameToClassNames(): void {
        const breakpointNames = Array.from(this.mediaService.breakpointToName.values());

        breakpointNames.forEach(breakpointName => {
            const classNames = this.parseClassNames(breakpointName);
            this.breakpointNameToClasses.set(breakpointName, classNames);
        });
    }

    /**
     * Parses a list of class names from a breakpoint name.
     *
     * Example:
     * 'desktop-landscape' => ['desktop', 'desktop-landscape']
     * 'small-desktop-landscape' => ['small-desktop', 'small-desktop-landscape']
     *
     * @param breakpointName The name of the breakpoint to parse
     */
    parseClassNames(breakpointName: string): string[] {
        const deviceTypeOrientationSeparatorIndex = breakpointName.lastIndexOf('-');
        let classNames = [breakpointName];

        if (deviceTypeOrientationSeparatorIndex >= 0) {
            const deviceType = breakpointName.slice(0, deviceTypeOrientationSeparatorIndex);
            const orientation = breakpointName.slice(deviceTypeOrientationSeparatorIndex + 1);
            classNames = [deviceType, `${deviceType}-${orientation}`];
        }

        return classNames;
    }

    /**
     * Removes all of the classes added by the directive.
     */
    removeClasses(): void {
        const classNameLists = Array.from(this.breakpointNameToClasses.values());
        // Flatten the arrays
        const classNames = [].concat(...classNameLists);

        classNames.forEach(className => this.renderer.removeClass(this.elementRef.nativeElement, className));
    }

    /**
     * Adds a list of classes to the host element.
     * @param classNames The class names to add
     */
    addClasses(classNames: string[]): void {
        if (!classNames) {
            return;
        }

        classNames.forEach(className => this.renderer.addClass(this.elementRef.nativeElement, className));
    }

    /**
     * Updates the classes on the host element and removes classes that are not needed for the active breakpoint.
     * @param classNames The class name to update
     */
    updateClasses(classNames: string[]): void {
        this.removeClasses();
        this.addClasses(classNames);
    }
}
