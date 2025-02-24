import { Component, Input, OnInit, Inject, forwardRef } from '@angular/core';
import { Subject } from 'rxjs';
import { ISellItem } from '../../../core/interfaces/sell-item.interface';
import { DiscoveryService } from '../../../core/discovery/discovery.service';
import { IUrlMenuItem } from '../../../core/actions/url-menu-item.interface';

@Component({
    selector: 'app-catalog-browser-item',
    templateUrl: './catalog-browser-item.component.html',
    styleUrls: ['./catalog-browser-item.component.scss']
})
export class CatalogBrowserItemComponent implements OnInit {
    @Input() item: ISellItem;
    @Input() loadFailImgSrc: string;

    loadingError = false;
    private imageLoaded$ = new Subject<boolean>();
    private imageError$ = new Subject<boolean>();

    imageSrc: string;
    imageLoaded = true;
    private _loadFailImgSrcUrl: string;

    // @ViewChild('itemImg') itemImage: Element;

    constructor(@Inject(forwardRef(() => DiscoveryService)) private discovery: DiscoveryService) {
    }

    ngOnInit(): void {
        let imageTimer: any = null;

        if (this.loadFailImgSrc) {
            this._loadFailImgSrcUrl = this.loadFailImgSrc;
            if (!this.loadFailImgSrc.startsWith('http')) {
                this._loadFailImgSrcUrl = `${this.discovery.getServerBaseURL()}/${this.loadFailImgSrc}`;
            }
        }

        if (this.showImage()) {
            this.imageSrc = (this.item.menuItems[0] as IUrlMenuItem).url;
            imageTimer = setTimeout(() => {
                this.imageSrc = this._loadFailImgSrcUrl;
                this.imageLoaded = false;
            },
                2000
            );

            this.imageLoaded$.subscribe(loaded => {
                this.imageLoaded = loaded;
                if (imageTimer) {
                    clearTimeout(imageTimer);
                }
            });
        }
    }

    showImage(): boolean {
        if (this.item.menuItems[0] && !this.item.menuItems[0].hasOwnProperty('url')) {
            return false;
        }

        if (!(this.item.menuItems[0] as IUrlMenuItem).url) {
            return this.item.description === null;
        }
        return true;
    }

    onImageLoaded(): void {
        this.imageLoaded$.next(true);
    }

    onImageLoadError(): void {
        this.imageSrc = this._loadFailImgSrcUrl;
        this.imageLoaded$.next(false);
        this.imageError$.next(true);
    }
}
