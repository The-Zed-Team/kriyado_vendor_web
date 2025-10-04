import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { CheckCircle2 } from "lucide-react"

export default function RegisterPage() {
  const [currentStep, setCurrentStep] = useState(1)
  const totalSteps = 3

  const steps = [
    { number: 1, title: "User Details", description: "Personal information" },
    { number: 2, title: "Address", description: "Location details" },
    { number: 3, title: "Branch Selection", description: "Preferred branch" }
  ]

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleSubmit = () => {
    console.log('Form submitted')
    alert('Registration completed successfully!')
  }

  return (
    <div className="w-full max-w-3xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Create Account</h1>
        <p className="text-muted-foreground">Complete all steps to register</p>
      </div>

      {/* Progress Bar */}
      <div className="mb-8 flex justify-center">
        <div className="w-full max-w-xl">
          <div className="flex items-start justify-between relative">
            {steps.map((step, index) => (
              <div key={step.number} className="flex flex-col items-center relative" style={{ width: index === 1 ? 'auto' : '120px' }}>
                <div className="relative flex items-center">
                  {index > 0 && (
                    <div
                      className={`absolute right-full w-24 h-0.5 transition-all ${
                        currentStep > step.number ? "bg-primary" : "bg-muted"
                      }`}
                      style={{ top: '50%', transform: 'translateY(-50%)', marginRight: '8px' }}
                    />
                  )}
                  <div
                    className={`w-8 h-8 rounded-full border-2 flex items-center justify-center text-sm font-semibold transition-all ${
                      currentStep > step.number
                        ? "border-primary bg-primary text-primary-foreground"
                        : currentStep === step.number
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-muted bg-background text-muted-foreground"
                    }`}
                  >
                    {currentStep > step.number ? (
                      <CheckCircle2 className="w-4 h-4" />
                    ) : (
                      step.number
                    )}
                  </div>
                </div>
                <div className="text-center mt-2">
                  <div
                    className={`text-xs font-medium ${
                      currentStep >= step.number ? "text-foreground" : "text-muted-foreground"
                    }`}
                  >
                    {step.title}
                  </div>
                  <div className="text-[10px] text-muted-foreground">{step.description}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Form Content */}
      <div className="border rounded-lg p-6 min-h-[500px]">
        {/* Step 1: User Details */}
        {currentStep === 1 && (
          <FieldSet>
            <FieldLegend>User Details</FieldLegend>
            <FieldDescription>
              Your personal information for account creation
            </FieldDescription>
            <FieldGroup>
              <div className="grid grid-cols-2 gap-4">
                <Field>
                  <FieldLabel htmlFor="first-name">First Name</FieldLabel>
                  <Input id="first-name" placeholder="John" />
                </Field>
                <Field>
                  <FieldLabel htmlFor="last-name">Last Name</FieldLabel>
                  <Input id="last-name" placeholder="Doe" />
                </Field>
              </div>
              <Field>
                <FieldLabel htmlFor="email">Email Address</FieldLabel>
                <Input
                  id="email"
                  type="email"
                  placeholder="john.doe@example.com"
                />
                <FieldDescription>
                  We'll use this for account notifications
                </FieldDescription>
              </Field>
              <Field>
                <FieldLabel htmlFor="phone">Phone Number</FieldLabel>
                <Input id="phone" type="tel" placeholder="+91 98765 43210" />
              </Field>
              <div className="grid grid-cols-2 gap-4">
                <Field>
                  <FieldLabel htmlFor="password">Password</FieldLabel>
                  <Input id="password" type="password" placeholder="••••••••" />
                </Field>
                <Field>
                  <FieldLabel htmlFor="confirm-password">
                    Confirm Password
                  </FieldLabel>
                  <Input
                    id="confirm-password"
                    type="password"
                    placeholder="••••••••"
                  />
                </Field>
              </div>
            </FieldGroup>
          </FieldSet>
        )}

        {/* Step 2: Address */}
        {currentStep === 2 && (
          <FieldSet>
            <FieldLegend>Address Information</FieldLegend>
            <FieldDescription>
              Your residential or business address
            </FieldDescription>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="street-address">Street Address</FieldLabel>
                <Input id="street-address" placeholder="123 Main Street" />
              </Field>
              <Field>
                <FieldLabel htmlFor="address-line-2">Address Line 2</FieldLabel>
                <Input
                  id="address-line-2"
                  placeholder="Apartment, suite, etc. (optional)"
                />
              </Field>
              <div className="grid grid-cols-2 gap-4">
                <Field>
                  <FieldLabel htmlFor="city">City</FieldLabel>
                  <Input id="city" placeholder="Thiruvananthapuram" />
                </Field>
                <Field>
                  <FieldLabel htmlFor="state">State/Province</FieldLabel>
                  <Select defaultValue="">
                    <SelectTrigger id="state">
                      <SelectValue placeholder="Select state" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="kerala">Kerala</SelectItem>
                      <SelectItem value="tamil-nadu">Tamil Nadu</SelectItem>
                      <SelectItem value="karnataka">Karnataka</SelectItem>
                      <SelectItem value="maharashtra">Maharashtra</SelectItem>
                      <SelectItem value="delhi">Delhi</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </Field>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Field>
                  <FieldLabel htmlFor="postal-code">Postal Code</FieldLabel>
                  <Input id="postal-code" placeholder="695001" />
                </Field>
                <Field>
                  <FieldLabel htmlFor="country">Country</FieldLabel>
                  <Select defaultValue="india">
                    <SelectTrigger id="country">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="india">India</SelectItem>
                      <SelectItem value="usa">United States</SelectItem>
                      <SelectItem value="uk">United Kingdom</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </Field>
              </div>
            </FieldGroup>
          </FieldSet>
        )}

        {/* Step 3: Branch Selection */}
        {currentStep === 3 && (
          <FieldSet>
            <FieldLegend>Branch Selection</FieldLegend>
            <FieldDescription>
              Choose your preferred branch location
            </FieldDescription>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="branch">Branch Location</FieldLabel>
                <Select defaultValue="">
                  <SelectTrigger id="branch">
                    <SelectValue placeholder="Select a branch" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="tvpm-main">
                      Thiruvananthapuram - Main Branch
                    </SelectItem>
                    <SelectItem value="tvpm-east">
                      Thiruvananthapuram - East
                    </SelectItem>
                    <SelectItem value="kochi">Kochi Branch</SelectItem>
                    <SelectItem value="kozhikode">Kozhikode Branch</SelectItem>
                    <SelectItem value="thrissur">Thrissur Branch</SelectItem>
                    <SelectItem value="kollam">Kollam Branch</SelectItem>
                  </SelectContent>
                </Select>
                <FieldDescription>
                  Select the branch nearest to you
                </FieldDescription>
              </Field>
              <Field>
                <FieldLabel htmlFor="account-type">Account Type</FieldLabel>
                <Select defaultValue="">
                  <SelectTrigger id="account-type">
                    <SelectValue placeholder="Select account type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="personal">Personal Account</SelectItem>
                    <SelectItem value="business">Business Account</SelectItem>
                    <SelectItem value="student">Student Account</SelectItem>
                    <SelectItem value="premium">Premium Account</SelectItem>
                  </SelectContent>
                </Select>
              </Field>
              <Field>
                <FieldLabel htmlFor="additional-notes">
                  Additional Notes
                </FieldLabel>
                <Textarea
                  id="additional-notes"
                  placeholder="Any special requirements or comments"
                  className="resize-none"
                  rows={3}
                />
              </Field>
              <div className="space-y-3 mt-4">
                <Field orientation="horizontal">
                  <Checkbox id="terms" />
                  <FieldLabel htmlFor="terms" className="font-normal">
                    I agree to the terms and conditions and privacy policy
                  </FieldLabel>
                </Field>
                <Field orientation="horizontal">
                  <Checkbox id="newsletter" />
                  <FieldLabel htmlFor="newsletter" className="font-normal">
                    Subscribe to newsletter for updates and offers
                  </FieldLabel>
                </Field>
              </div>
            </FieldGroup>
          </FieldSet>
        )}
      </div>

      {/* Navigation Buttons */}
      <div className="flex justify-between mt-6">
        <Button
          variant="outline"
          onClick={handlePrevious}
          disabled={currentStep === 1}
        >
          Previous
        </Button>
        <div className="flex gap-3">
          <Button variant="outline" type="button">
            Cancel
          </Button>
          {currentStep < totalSteps ? (
            <Button onClick={handleNext}>
              Next
            </Button>
          ) : (
            <Button onClick={handleSubmit}>
              Submit
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}