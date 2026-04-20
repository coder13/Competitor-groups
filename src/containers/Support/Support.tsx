import { useEffect } from 'react';
import { Container } from '@/components/Container';

export function SupportContainer() {
  useEffect(() => {
    document.title = 'Support - Competition Groups';
  }, []);

  return (
    <Container className="overflow-auto">
      <div className="flex flex-col items-center">
        <div className="flex w-full max-w-3xl flex-col space-y-4 p-2 pt-2 type-body md:px-0 md:type-body">
          <p className="type-body">Thanks for being a user of Competition Groups!</p>
          <p className="type-body">
            This website is a passion project by Cailyn Sinclair.
            <br />I do not receive any compensation for developing this platform, and if you find
            this website useful, please consider supporting me by buying me a coffee
          </p>
          <iframe
            id="kofiframe"
            src="https://ko-fi.com/klynh/?hidefeed=true&widget=true&embed=true&preview=true"
            className="w-full border-none p-2"
            height="800"
            title="klynh"
          />
        </div>
      </div>
    </Container>
  );
}
