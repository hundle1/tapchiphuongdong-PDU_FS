'use client';

import React, { useState, useEffect, useRef, useCallback, useImperativeHandle } from 'react';
import Image from 'next/image';
import { PageFlip } from 'page-flip';
import { ChevronLeft, ChevronRight, RotateCcw, Printer, Download, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface Page {
  id: string;
  pageNumber: number;
  imageUrl: string;
  content: string | null;
}

interface MagazineReaderProps {
  pages: Page[];
  title: string;
  className?: string;
  style?: React.CSSProperties;
  width?: number;
  height?: number;
  size?: 'fixed' | 'stretch';
  minWidth?: number;
  maxWidth?: number;
  minHeight?: number;
  maxHeight?: number;
  drawShadow?: boolean;
  flippingTime?: number;
  usePortrait?: boolean;
  startZIndex?: number;
  autoSize?: boolean;
  maxShadowOpacity?: number;
  showCover?: boolean;
  mobileScrollSupport?: boolean;
  onFlip?: (e: any) => void;
  onChangeOrientation?: (e: any) => void;
  onChangeState?: (e: any) => void;
  onInit?: (e: any) => void;
  onUpdate?: (e: any) => void;
}

const MagazineReaderForward = React.forwardRef<PageFlip, MagazineReaderProps>(
  function MagazineReaderForward(props, ref) {
    const {
      pages,
      title,
      className = '',
      style = {},
      width = 600,
      height = 800,
      size = 'fixed',
      minWidth = 315,
      maxWidth = 1000,
      minHeight = 420,
      maxHeight = 1350,
      drawShadow = true,
      flippingTime = 1000,
      usePortrait = false,
      startZIndex = 0,
      autoSize = true,
      maxShadowOpacity = 0.2,
      showCover = true,
      mobileScrollSupport = true,
      onFlip,
      onChangeOrientation,
      onChangeState,
      onInit,
      onUpdate
    } = props;

    const htmlElementRef = useRef<HTMLDivElement>(null);
    const childRef = useRef<HTMLDivElement[]>([]);
    const pageFlip = useRef<PageFlip>();
    const [currentPage, setCurrentPage] = useState<number>(0);
    const [totalPages, setTotalPages] = useState<number>(0);
    const [pageElements, setPageElements] = useState<React.ReactElement[]>([]);

    useImperativeHandle(ref, () => pageFlip.current!, []);

    useEffect(() => {
      if (pages && pages.length > 0) {
        childRef.current = [];
        const elements = pages.map((page, index) => (
          <div
            key={page.id}
            ref={(dom: HTMLDivElement) => {
              if (dom) childRef.current[index] = dom;
            }}
            className="page-content"
          >
            <div className="relative w-full h-full">
              <Image
                src={page.imageUrl}
                alt={`Trang ${page.pageNumber}`}
                fill
                className="object-contain bg-white"
                priority={index < 2}
                sizes="(max-width: 768px) 100vw, 600px"
              />
              {page.content && (
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6">
                  <p className="text-white text-sm font-medium">{page.content}</p>
                </div>
              )}
            </div>
          </div>
        ));

        setPageElements(elements);
        setTotalPages(pages.length);
      }
    }, [pages]);

    useEffect(() => {
      const initializePageFlip = () => {
        if (pageElements.length > 0 && childRef.current.length > 0 && htmlElementRef.current) {
          if (pageFlip.current) {
            pageFlip.current.off('flip');
            pageFlip.current.off('changeOrientation');
            pageFlip.current.off('changeState');
            pageFlip.current.off('init');
            pageFlip.current.off('update');
          }

          if (!pageFlip.current) {
            pageFlip.current = new PageFlip(htmlElementRef.current, {
              width,
              height,
              size: size as any,
              minWidth,
              maxWidth,
              minHeight,
              maxHeight,
              drawShadow: true,
              flippingTime: 600,
              usePortrait,
              startZIndex,
              autoSize,
              maxShadowOpacity: 0.25,
              showCover,
              mobileScrollSupport,
              swipeDistance: 50,
              useMouseEvents: true,
            });
          }

          if (!pageFlip.current.getFlipController()) {
            pageFlip.current.loadFromHTML(childRef.current);
          } else {
            pageFlip.current.updateFromHtml(childRef.current);
          }

          if (onFlip) {
            pageFlip.current.on('flip', (e: any) => {
              setCurrentPage(typeof e.data === 'number' ? e.data : 0);
              onFlip(e);
            });
          } else {
            pageFlip.current.on('flip', (e: any) => {
              setCurrentPage(typeof e.data === 'number' ? e.data : 0);
            });
          }

          pageFlip.current.on('start', () => {
            htmlElementRef.current?.classList.add('page-flipping');
          });
          pageFlip.current.on('end', () => {
            htmlElementRef.current?.classList.remove('page-flipping');
          });

          if (onChangeOrientation) pageFlip.current.on('changeOrientation', onChangeOrientation);
          if (onChangeState) pageFlip.current.on('changeState', onChangeState);
          if (onInit) pageFlip.current.on('init', onInit);
          if (onUpdate) pageFlip.current.on('update', onUpdate);
        }
      };

      if (pageElements.length > 0) {
        setTimeout(initializePageFlip, 100);
      }
    }, [pageElements, width, height, size, minWidth, maxWidth, minHeight, maxHeight, drawShadow, flippingTime, usePortrait, startZIndex, autoSize, maxShadowOpacity, showCover, mobileScrollSupport, onFlip, onChangeOrientation, onChangeState, onInit, onUpdate]);

    const nextPage = useCallback(() => {
      if (pageFlip.current) pageFlip.current.flipNext();
    }, []);

    const prevPage = useCallback(() => {
      if (pageFlip.current) pageFlip.current.flipPrev();
    }, []);

    const goToPage = useCallback((pageIndex: number) => {
      if (pageFlip.current && pageIndex >= 0 && pageIndex < totalPages) {
        pageFlip.current.flip(pageIndex);
      }
    }, [totalPages]);

    useEffect(() => {
      const handleKeyPress = (e: KeyboardEvent) => {
        if (e.key === 'ArrowRight') nextPage();
        if (e.key === 'ArrowLeft') prevPage();
      };
      window.addEventListener('keydown', handleKeyPress);
      return () => window.removeEventListener('keydown', handleKeyPress);
    }, [nextPage, prevPage]);

    if (!pages || pages.length === 0) {
      return (
        <div className="flex items-center justify-center min-h-[400px] bg-gray-50 rounded-lg">
          <p className="text-gray-500 font-medium">Không có trang nào để hiển thị</p>
        </div>
      );
    }
    function getVisiblePages(current: number, total: number, delta: number = 2) {
      const range: (number | string)[] = [];
      const left = Math.max(2, current - delta);
      const right = Math.min(total - 1, current + delta);

      range.push(1);
      if (left > 2) range.push("...");

      for (let i = left; i <= right; i++) {
        range.push(i);
      }

      if (right < total - 1) range.push("...");
      if (total > 1) range.push(total);

      return range;
    }

    return (
      <>
        <div className={`max-w-6xl mx-auto px-4 ${className}`} style={style}>
          <div className="flex justify-between items-center mb-2 gap-4">
            <div className="flex gap-2 flex-wrap">
              {getVisiblePages(currentPage + 1, totalPages).map((p, i) =>
                p === "..." ? (
                  <span key={i} className="px-2 text-white">...</span>
                ) : (
                  <Button
                    key={i}
                    variant={typeof p === "number" && p - 1 === currentPage ? "default" : "outline"}
                    size="sm"
                    className="w-7 h-7 rounded-full"
                    onClick={() => goToPage((p as number) - 1)}
                  >
                    {p}
                  </Button>
                )
              )}
            </div>
            <p className="text-center text-sm text-gray-500 ">
              Sử dụng phím mũi tên ← → để chuyển trang, hoặc kéo thả để lật trang
            </p>
            <div className="flex gap-2">
              <Badge
                variant="outline"
                className="cursor-pointer bg-white rounded-sm px-2 py-1"
                onClick={() => window.print()}
              >
                <Printer className="h-4 w-4" />
              </Badge>
              <Badge
                variant="outline"
                className="cursor-pointer bg-white rounded-sm px-2 py-1"
              >
                <Download className="h-4 w-4" />
              </Badge>
              <Badge
                variant="outline"
                className="cursor-pointer bg-white rounded-sm px-2 py-1"
              >
                <Share2 className="h-4 w-4" />
              </Badge>
            </div>
          </div>

          <div className="relative flex justify-center shadow-2xl">
            <div
              ref={htmlElementRef}
              className="flip-book bg-white"
              style={{ minHeight: height || 800 }}
            >
              {pageElements}
            </div>
          </div>

          <div className="flex items-center justify-between mt-2 gap-4">
            <Button
              variant="outline"
              size="lg"
              onClick={prevPage}
              disabled={currentPage === 0}
              className="flex-1"
            >
              <ChevronLeft className="h-5 w-5 mr-2" />
              Trang trước
            </Button>
            <Button
              variant="outline"
              size="lg"
              onClick={() => goToPage(0)}
              disabled={currentPage === 0}
              className="flex-1"
            >
              <RotateCcw className="h-5 w-5 mr-2" />
              Về đầu
            </Button>
            <Button
              variant="outline"
              size="lg"
              onClick={nextPage}
              disabled={currentPage === totalPages - 1}
              className="flex-1"
            >
              Trang sau
              <ChevronRight className="h-5 w-5 ml-2" />
            </Button>
          </div>
        </div>
        <style jsx>{`
          .flip-book {
            margin: 0 auto;
            background: linear-gradient(to bottom, #ffffff, #f8fafc);
            transition: transform 0.3s ease, box-shadow 0.3s ease;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
          }

          .page-content {
            background: white;
            border-radius: 8px;
            overflow: hidden;
            transition: transform 0.5s ease, box-shadow 0.3s ease;
          }

          .page-content:hover {
            transform: scale(1.015);
            box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
          }

          .flip-book .page-content {
            cursor: grab;
            user-select: none;
            -webkit-tap-highlight-color: transparent;
          }

          .page-flipping {
            transform: scale(1.01);
            box-shadow: 0 12px 30px rgba(0, 0, 0, 0.2);
          }

          .page-flipping:active {
            cursor: grabbing;
          }

          @media (max-width: 768px) {
            .flip-book {
              width: 95% !important;
              max-width: 95% !important;
            }
          }
        `}</style>
      </>
    );
  }
);

export const MagazineReader = React.memo(MagazineReaderForward);