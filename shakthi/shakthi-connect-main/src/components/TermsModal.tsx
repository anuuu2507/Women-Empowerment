import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useLanguage } from '@/contexts/LanguageContext';

interface TermsModalProps {
  open: boolean;
  onClose: () => void;
}

const TermsModal = ({ open, onClose }: TermsModalProps) => {
  const { t } = useLanguage();

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl">{t('termsConditions')}</DialogTitle>
        </DialogHeader>

        <ScrollArea className="h-[60vh] pr-4">
          <div className="space-y-6 text-sm text-muted-foreground">
            <section>
              <h3 className="font-semibold text-foreground mb-2">1. Platform Purpose</h3>
              <p>
                SheRise is a women-only empowerment platform designed exclusively for women to find work opportunities and offer services. This platform is designed of the women, for the women, by the women.
              </p>
            </section>

            <section>
              <h3 className="font-semibold text-foreground mb-2">2. Eligibility</h3>
              <ul className="list-disc list-inside space-y-1">
                <li>Only users verified as female through Aadhaar OTP e-KYC are eligible to register.</li>
                <li>Users must be 18 years or older.</li>
                <li>Users must provide accurate and truthful information during registration.</li>
              </ul>
            </section>

            <section>
              <h3 className="font-semibold text-foreground mb-2">3. Privacy & Data Security</h3>
              <ul className="list-disc list-inside space-y-1">
                <li>We never collect or store Aadhaar images.</li>
                <li>Gender verification is done through secure Aadhaar OTP e-KYC via government-approved providers.</li>
                <li>Personal information is encrypted and stored securely.</li>
                <li>We do not share your data with third parties without consent.</li>
              </ul>
            </section>

            <section>
              <h3 className="font-semibold text-foreground mb-2">4. User Conduct</h3>
              <ul className="list-disc list-inside space-y-1">
                <li>Users must behave respectfully towards other community members.</li>
                <li>Fraudulent activities, fake reviews, or misrepresentation will result in account termination.</li>
                <li>Users must complete accepted work assignments professionally and on time.</li>
                <li>Harassment of any kind will not be tolerated.</li>
              </ul>
            </section>

            <section>
              <h3 className="font-semibold text-foreground mb-2">5. Work & Payments</h3>
              <ul className="list-disc list-inside space-y-1">
                <li>Payment terms are agreed between workers and customers.</li>
                <li>The platform may charge a service fee on transactions.</li>
                <li>Credits earned can be withdrawn as per platform policies.</li>
                <li>Disputes should be reported through the platform's support system.</li>
              </ul>
            </section>

            <section>
              <h3 className="font-semibold text-foreground mb-2">6. Safety Guidelines</h3>
              <ul className="list-disc list-inside space-y-1">
                <li>Meet customers in safe, public locations when possible.</li>
                <li>Use in-app communication features to protect your personal contact information.</li>
                <li>Report any suspicious activity immediately.</li>
                <li>The platform provides real-time location sharing for safety.</li>
              </ul>
            </section>

            <section>
              <h3 className="font-semibold text-foreground mb-2">7. Reviews & Ratings</h3>
              <ul className="list-disc list-inside space-y-1">
                <li>Users can rate and review workers after task completion.</li>
                <li>Reviews must be honest and based on actual experience.</li>
                <li>False or malicious reviews may be removed.</li>
              </ul>
            </section>

            <section>
              <h3 className="font-semibold text-foreground mb-2">8. Account Termination</h3>
              <p>
                The platform reserves the right to suspend or terminate accounts that violate these terms, engage in fraudulent activities, or harm the community.
              </p>
            </section>

            <section>
              <h3 className="font-semibold text-foreground mb-2">9. Modifications</h3>
              <p>
                These terms may be updated periodically. Users will be notified of significant changes. Continued use of the platform constitutes acceptance of updated terms.
              </p>
            </section>

            <section>
              <h3 className="font-semibold text-foreground mb-2">10. Contact</h3>
              <p>
                For questions or concerns about these terms, please contact our support team through the app or email us at support@sherise.com
              </p>
            </section>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default TermsModal;
