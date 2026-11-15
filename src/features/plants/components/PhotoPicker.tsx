import { useCallback, useEffect, useRef, useState, type ChangeEvent } from 'react';
import { useTranslation } from 'react-i18next';
import Webcam from 'react-webcam';
import { Button } from '../../../components/ui/Button';

const CAMERA_WIDTH_PX = 960;
const CAMERA_HEIGHT_PX = 720;
const CAPTURE_MIME_TYPE = 'image/jpeg';
const ACCEPTED_TYPES = 'image/jpeg,image/png,image/webp';

interface PhotoPickerProps {
  photo: File | null;
  onChange: (photo: File | null) => void;
  disabled?: boolean;
}

async function dataUrlToFile(dataUrl: string): Promise<File> {
  const blob = await (await fetch(dataUrl)).blob();
  return new File([blob], `capture-${Date.now()}.jpg`, { type: CAPTURE_MIME_TYPE });
}

export function PhotoPicker({ photo, onChange, disabled = false }: PhotoPickerProps) {
  const { t } = useTranslation();
  const webcamRef = useRef<Webcam>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [cameraOpen, setCameraOpen] = useState(false);
  const [cameraFailed, setCameraFailed] = useState(false);
  const [preview, setPreview] = useState<{ file: File; url: string } | null>(null);

  useEffect(() => {
    if (!photo) return;
    let cancelled = false;
    const reader = new FileReader();
    reader.onload = () => {
      if (!cancelled && typeof reader.result === 'string') {
        setPreview({ file: photo, url: reader.result });
      }
    };
    reader.readAsDataURL(photo);
    return () => {
      cancelled = true;
      reader.abort();
    };
  }, [photo]);

  const previewUrl = preview && preview.file === photo ? preview.url : null;

  const capture = useCallback(async () => {
    const screenshot = webcamRef.current?.getScreenshot();
    if (!screenshot) return;
    onChange(await dataUrlToFile(screenshot));
    setCameraOpen(false);
  }, [onChange]);

  const onFileSelected = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) onChange(file);
    event.target.value = '';
  };

  return (
    <div className="space-y-3">
      {cameraOpen ? (
        <div className="space-y-3">
          <Webcam
            ref={webcamRef}
            audio={false}
            screenshotFormat={CAPTURE_MIME_TYPE}
            videoConstraints={{
              width: CAMERA_WIDTH_PX,
              height: CAMERA_HEIGHT_PX,
              facingMode: 'environment',
            }}
            onUserMediaError={() => {
              setCameraFailed(true);
              setCameraOpen(false);
            }}
            className="w-full rounded-xl bg-black"
          />
          <div className="flex gap-2">
            <Button onClick={() => void capture()}>{t('photo.capture')}</Button>
            <Button variant="secondary" onClick={() => setCameraOpen(false)}>
              {t('common.cancel')}
            </Button>
          </div>
        </div>
      ) : previewUrl ? (
        <img
          src={previewUrl}
          alt={t('photo.previewAlt')}
          className="max-h-72 w-full rounded-xl border border-[var(--color-border)] object-cover"
        />
      ) : (
        <p className="rounded-xl border border-dashed border-[var(--color-border)] p-6 text-center text-sm text-[var(--color-text-secondary)]">
          {t('photo.empty')}
        </p>
      )}

      {cameraFailed && (
        <p role="alert" className="text-sm text-[var(--color-danger)]">
          {t('photo.cameraError')}
        </p>
      )}

      {!cameraOpen && (
        <div className="flex flex-wrap gap-2">
          <Button
            variant="secondary"
            disabled={disabled}
            onClick={() => {
              setCameraFailed(false);
              setCameraOpen(true);
            }}
          >
            {t('photo.useCamera')}
          </Button>
          <Button
            variant="secondary"
            disabled={disabled}
            onClick={() => fileInputRef.current?.click()}
          >
            {t(photo ? 'photo.changeFile' : 'photo.chooseFile')}
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept={ACCEPTED_TYPES}
            className="sr-only"
            tabIndex={-1}
            aria-label={t('photo.chooseFile')}
            onChange={onFileSelected}
          />
        </div>
      )}
    </div>
  );
}
