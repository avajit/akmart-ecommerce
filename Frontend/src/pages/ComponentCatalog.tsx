import React, { useState } from 'react';
import {
  Container,
  Button,
  IconButton,
  Input,
  Textarea,
  Select,
  Badge,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  Price,
  Rating,
  QuantityStepper,
  Skeleton,
  EmptyState,
  ErrorState,
} from '../components/ui';

export default function ComponentCatalog() {
  const [stepperVal, setStepperVal] = useState<number>(2);
  const [inputValue, setInputValue] = useState<string>('Pokhara, Kaski');
  const [selectValue, setSelectValue] = useState<string>('bagmati');

  return (
    <div className="min-h-screen bg-surface-base text-foreground-primary py-8 sm:py-12 pb-24">
      <Container size="lg" className="space-y-12">
        {/* Header */}
        <div className="border-b border-border-subtle pb-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="saffron" dot>Enterprise Design System</Badge>
              <Badge variant="success">WCAG 2.2 AA Compliant</Badge>
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-foreground-primary">
              AKMart Component Catalog
            </h1>
            <p className="text-sm text-foreground-secondary mt-1">
              Accessible, responsive, high-contrast UI primitives for Himalayan Modern Marketplace.
            </p>
          </div>
          <div className="text-xs text-foreground-secondary bg-surface-card px-3 py-1.5 rounded-lg border border-border-subtle inline-block">
            Chunk: <strong className="text-brand-saffron">CHUNK-A0</strong>
          </div>
        </div>

        {/* 1. Buttons */}
        <section className="space-y-4" aria-labelledby="buttons-heading">
          <div className="flex items-center justify-between">
            <h2 id="buttons-heading" className="text-lg sm:text-xl font-bold tracking-tight">
              1. Buttons (Min 44px Tap Height & WCAG Contrast)
            </h2>
            <span className="text-xs text-foreground-secondary">Variants & States</span>
          </div>

          <Card padding="md" className="space-y-6">
            <div>
              <h3 className="text-xs font-semibold text-foreground-secondary uppercase tracking-wider mb-3">
                Standard Variants
              </h3>
              <div className="flex flex-wrap items-center gap-3">
                <Button variant="primary">Primary (Rust #C2410C)</Button>
                <Button variant="saffron">Saffron (#F97316)</Button>
                <Button variant="secondary">Secondary Card</Button>
                <Button variant="outline">Outline</Button>
                <Button variant="ghost">Ghost Action</Button>
                <Button variant="danger">Danger Destructive</Button>
              </div>
            </div>

            <div>
              <h3 className="text-xs font-semibold text-foreground-secondary uppercase tracking-wider mb-3">
                States & Sizes
              </h3>
              <div className="flex flex-wrap items-center gap-3">
                <Button variant="primary" size="sm">Small (44px target)</Button>
                <Button variant="primary" size="md">Medium Default</Button>
                <Button variant="primary" size="lg">Large Hero</Button>
                <Button variant="primary" isLoading loadingText="Processing...">Loading State</Button>
                <Button variant="primary" disabled>Disabled State</Button>
              </div>
            </div>

            <div>
              <h3 className="text-xs font-semibold text-foreground-secondary uppercase tracking-wider mb-3">
                Icon Buttons (Strict 44x44px Tap Targets)
              </h3>
              <div className="flex flex-wrap items-center gap-3">
                <IconButton aria-label="Add to wishlist" variant="secondary">
                  <svg className="w-5 h-5 text-rose-400" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                    <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                  </svg>
                </IconButton>
                <IconButton aria-label="Search catalog" variant="ghost">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </IconButton>
                <IconButton aria-label="Share product" variant="outline">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                  </svg>
                </IconButton>
                <IconButton aria-label="Delete item" variant="danger">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </IconButton>
              </div>
            </div>
          </Card>
        </section>

        {/* 2. Form Controls */}
        <section className="space-y-4" aria-labelledby="forms-heading">
          <div className="flex items-center justify-between">
            <h2 id="forms-heading" className="text-lg sm:text-xl font-bold tracking-tight">
              2. Form Controls (16px Mobile Font, Defeats iOS Auto-Zoom)
            </h2>
            <span className="text-xs text-foreground-secondary">Input, Select, Textarea</span>
          </div>

          <Card padding="md">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label="Full Name (with required mark)"
                required
                placeholder="Avash Shrestha"
                helperText="Enter your government legal name as registered."
              />

              <Input
                label="Nepal Mobile Phone"
                required
                placeholder="9841XXXXXX"
                defaultValue="9801234567"
                iconLeft={
                  <span className="text-xs font-semibold text-foreground-secondary">+977</span>
                }
                helperText="We will send a Cash on Delivery OTP code."
              />

              <Input
                label="Delivery Address (Error State)"
                required
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                error="Please provide a valid street or tole landmark."
              />

              <Select
                label="Province Selection"
                required
                value={selectValue}
                onChange={(e) => setSelectValue(e.target.value)}
                options={[
                  { value: 'koshi', label: 'Koshi Province' },
                  { value: 'madhesh', label: 'Madhesh Province' },
                  { value: 'bagmati', label: 'Bagmati Province (Kathmandu Valley)' },
                  { value: 'gandaki', label: 'Gandaki Province (Pokhara)' },
                  { value: 'lumbini', label: 'Lumbini Province' },
                  { value: 'karnali', label: 'Karnali Province' },
                  { value: 'sudurpashchim', label: 'Sudurpashchim Province' },
                ]}
                helperText="Select for accurate regional delivery estimates."
              />

              <div className="md:col-span-2">
                <Textarea
                  label="Special Delivery Instructions"
                  placeholder="Near the temple, ring the bell on the 2nd floor..."
                  showCount
                  maxLength={200}
                  helperText="Optional notes for the courier partner."
                />
              </div>
            </div>
          </Card>
        </section>

        {/* 3. Badges, Price & Rating */}
        <section className="space-y-4" aria-labelledby="ecom-heading">
          <div className="flex items-center justify-between">
            <h2 id="ecom-heading" className="text-lg sm:text-xl font-bold tracking-tight">
              3. E-Commerce Elements (Price, Rating, Badges, Stepper)
            </h2>
            <span className="text-xs text-foreground-secondary">Lakh / Crore Formatting</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Price Formatting */}
            <Card padding="md" className="space-y-4">
              <CardTitle>South Asian Price Formatting</CardTitle>
              <CardDescription>Formatted via en-IN locale with strike-through and discount badge.</CardDescription>
              <div className="space-y-3 pt-2">
                <div>
                  <span className="text-xs text-foreground-secondary block mb-1">Small accessory:</span>
                  <Price amount={450} originalPrice={600} size="sm" />
                </div>
                <div>
                  <span className="text-xs text-foreground-secondary block mb-1">Handmade Pashmina Shawl:</span>
                  <Price amount={4500} originalPrice={6000} size="md" highlight />
                </div>
                <div>
                  <span className="text-xs text-foreground-secondary block mb-1">Gold-Plated Buddha Statue:</span>
                  <Price amount={125000} originalPrice={150000} size="lg" />
                </div>
              </div>
            </Card>

            {/* Badges */}
            <Card padding="md" className="space-y-4">
              <CardTitle>Semantic Status Badges</CardTitle>
              <CardDescription>WCAG AA contrast verified pill tokens.</CardDescription>
              <div className="flex flex-wrap gap-2 pt-2">
                <Badge variant="success" dot>Verified Merchant</Badge>
                <Badge variant="success">In Stock</Badge>
                <Badge variant="warning" dot>Only 2 Left</Badge>
                <Badge variant="error">Out of Stock</Badge>
                <Badge variant="saffron" dot>Featured Deal</Badge>
                <Badge variant="info">Cash on Delivery</Badge>
                <Badge variant="neutral">Handmade</Badge>
              </div>
            </Card>

            {/* Stepper & Rating */}
            <Card padding="md" className="space-y-4">
              <CardTitle>Quantity & Rating Primitives</CardTitle>
              <CardDescription>44x44px stepper buttons + fractional star calculation.</CardDescription>
              <div className="space-y-4 pt-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-foreground-primary">Order Quantity:</span>
                  <QuantityStepper
                    value={stepperVal}
                    onChange={setStepperVal}
                    min={1}
                    max={10}
                    ariaLabel="Cart quantity"
                  />
                </div>
                <div className="pt-2 border-t border-border-subtle flex flex-col gap-2">
                  <Rating rating={4.8} reviewCount={142} size="md" />
                  <Rating rating={3.5} reviewCount={28} size="sm" />
                </div>
              </div>
            </Card>
          </div>
        </section>

        {/* 4. Skeletons */}
        <section className="space-y-4" aria-labelledby="skeleton-heading">
          <div className="flex items-center justify-between">
            <h2 id="skeleton-heading" className="text-lg sm:text-xl font-bold tracking-tight">
              4. Shimmer Skeletons (Zero Layout Shift)
            </h2>
            <span className="text-xs text-foreground-secondary">Instant Perceived Performance</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            <Skeleton variant="productCard" />
            <Skeleton variant="productCard" />
            <Skeleton variant="card" />
          </div>
        </section>

        {/* 5. Empty & Error States */}
        <section className="space-y-4" aria-labelledby="feedback-heading">
          <div className="flex items-center justify-between">
            <h2 id="feedback-heading" className="text-lg sm:text-xl font-bold tracking-tight">
              5. Empty & Error States (Graceful Feedback)
            </h2>
            <span className="text-xs text-foreground-secondary">Recovery Actions</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card padding="none" className="bg-surface-subtle">
              <EmptyState
                title="Your Cart is Empty"
                description="Explore our handpicked collection of authentic Nepali handicrafts, teas, and clothing."
                actionLabel="Explore Collection"
                onAction={() => alert('Navigate to /collection')}
                secondaryActionLabel="View Wishlist"
                onSecondaryAction={() => alert('Navigate to /wishlist')}
              />
            </Card>

            <Card padding="none" className="bg-surface-subtle">
              <ErrorState
                title="Unable to load catalog"
                message="We could not connect to the catalog server. Please check your network connection."
                retryLabel="Retry Connection"
                onRetry={() => alert('Retrying connection...')}
                homeLabel="Go to Home"
                onHome={() => alert('Navigate to /')}
              />
            </Card>
          </div>
        </section>
      </Container>
    </div>
  );
}
